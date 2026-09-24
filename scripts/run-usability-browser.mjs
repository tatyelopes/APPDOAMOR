import { spawn } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const apiPort = 8790
const appPort = 5174
const debugPort = 9333
const temporaryRoot = await mkdtemp(join(tmpdir(), 'conectadois-usability-'))
const processes = []
const consoleIssues = []

function start(command, args, env = {}) {
  const child = spawn(command, args, {
    cwd: projectRoot,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  processes.push(child)
  child.stderr.on('data', (chunk) => {
    const message = String(chunk)
    if (!message.includes('ExperimentalWarning')) consoleIssues.push(message.trim())
  })
  return child
}

async function waitFor(url, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.status > 0) return response
    } catch {
      // The service may still be starting; retry until the configured timeout.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 250))
  }
  throw new Error(`Tempo esgotado aguardando ${url}`)
}

function cdpClient(socketUrl) {
  const socket = new WebSocket(socketUrl)
  let nextId = 0
  const pending = new Map()
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      const { resolve: resolveCall, reject } = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) reject(new Error(message.error.message))
      else resolveCall(message.result)
    }
  })
  return {
    ready: new Promise((resolveReady, reject) => {
      socket.addEventListener('open', resolveReady, { once: true })
      socket.addEventListener('error', reject, { once: true })
    }),
    send(method, params = {}) {
      const id = ++nextId
      return new Promise((resolveCall, reject) => {
        pending.set(id, { resolve: resolveCall, reject })
        socket.send(JSON.stringify({ id, method, params }))
      })
    },
    close: () => socket.close(),
  }
}

async function jsonRequest(path, options = {}) {
  const response = await fetch(`http://127.0.0.1:${apiPort}/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const value = await response.json()
  if (!response.ok) throw new Error(value.error || `HTTP ${response.status}`)
  return value
}

let cdp
try {
  start(process.execPath, ['server/index.mjs'], {
    PORT: String(apiPort),
    HOST: '127.0.0.1',
    APP_ORIGIN: `http://127.0.0.1:${appPort}`,
    DATABASE_FILE: join(temporaryRoot, 'database.json'),
  })
  start(process.execPath, [
    'node_modules/vite/bin/vite.js',
    '--host',
    '127.0.0.1',
    '--port',
    String(appPort),
    '--strictPort',
  ])
  start(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${join(temporaryRoot, 'edge-profile')}`,
    '--no-first-run',
    '--disable-extensions',
    '--disable-background-networking',
    'about:blank',
  ])

  await Promise.all([
    waitFor(`http://127.0.0.1:${apiPort}/api/me`),
    waitFor(`http://127.0.0.1:${appPort}`),
    waitFor(`http://127.0.0.1:${debugPort}/json/list`),
  ])

  const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()
  cdp = cdpClient(targets.find((target) => target.type === 'page').webSocketDebuggerUrl)
  await cdp.ready
  await Promise.all([
    cdp.send('Page.enable'),
    cdp.send('Runtime.enable'),
    cdp.send('Log.enable'),
    cdp.send('Network.enable'),
  ])
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      const originalFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const url = typeof input === 'string' ? input : input.url;
        const rewritten = url.startsWith('/api') ? 'http://127.0.0.1:${apiPort}' + url : input;
        return originalFetch(rewritten, init);
      };
    `,
  })

  async function evaluate(expression) {
    const result = await cdp.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
    if (result.exceptionDetails)
      throw new Error(result.exceptionDetails.exception?.description || 'Falha ao avaliar a página')
    return result.result.value
  }
  async function waitForExpression(expression, attempts = 80) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      if (await evaluate(expression)) return
      await new Promise((resolveWait) => setTimeout(resolveWait, 125))
    }
    throw new Error(`Tempo esgotado aguardando: ${expression}`)
  }
  async function clickText(text) {
    const encoded = JSON.stringify(text)
    const clicked = await evaluate(
      `(() => { const element = [...document.querySelectorAll('button')].find(item => item.textContent.includes(${encoded})); if (!element) return false; element.click(); return true })()`,
    )
    if (!clicked) throw new Error(`Botão não encontrado: ${text}`)
    await new Promise((resolveWait) => setTimeout(resolveWait, 180))
  }
  async function type(selector, value) {
    const encodedSelector = JSON.stringify(selector)
    const encodedValue = JSON.stringify(value)
    const changed = await evaluate(
      `(() => { const element = document.querySelector(${encodedSelector}); if (!element) return false; const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; const setter = Object.getOwnPropertyDescriptor(prototype, 'value').set; setter.call(element, ${encodedValue}); element.dispatchEvent(new Event('input', { bubbles: true })); return true })()`,
    )
    if (!changed) throw new Error(`Campo não encontrado: ${selector}`)
  }
  async function pageSnapshot(label) {
    return evaluate(`(() => {
      const interactive = [...document.querySelectorAll('button,input,textarea,a')];
      const unnamed = interactive.filter(element => !(element.getAttribute('aria-label') || element.textContent.trim() || element.getAttribute('placeholder'))).length;
      const smallTargets = interactive.filter(element => { const box = element.getBoundingClientRect(); return box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44) }).map(element => ({ text: (element.textContent || element.getAttribute('aria-label') || element.tagName).trim().slice(0, 45), width: Math.round(element.getBoundingClientRect().width), height: Math.round(element.getBoundingClientRect().height) }));
      return { label: ${JSON.stringify(label)}, title: document.title, heading: document.querySelector('h1')?.innerText || '', viewport: [innerWidth, innerHeight], scrollWidth: document.documentElement.scrollWidth, horizontalOverflow: document.documentElement.scrollWidth > innerWidth, interactiveCount: interactive.length, unnamedControls: unnamed, smallTargets };
    })()`)
  }

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  })
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${appPort}/app` })
  await waitForExpression(`document.querySelector('.onboarding-shell') !== null`)
  if (process.env.CAPTURE_WIREFRAMES === '1') {
    const screenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-entrada-mobile-preview.png'),
      Buffer.from(screenshot.data, 'base64'),
    )
  }
  const snapshots = [await pageSnapshot('Onboarding mobile')]
  const firstFocus = await evaluate(
    `(() => { document.querySelector('button')?.focus(); return document.activeElement?.textContent.trim() })()`,
  )
  await clickText('Continuar')
  if (process.env.CAPTURE_WIREFRAMES === '1') {
    const screenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-entrada-etapa-2-mobile-preview.png'),
      Buffer.from(screenshot.data, 'base64'),
    )
  }
  await clickText('Continuar')
  if (process.env.CAPTURE_WIREFRAMES === '1') {
    const screenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-entrada-etapa-3-mobile-preview.png'),
      Buffer.from(screenshot.data, 'base64'),
    )
  }
  await clickText('Criar minha conta')
  await waitForExpression(`document.querySelector('.auth-card') !== null`)
  if (process.env.CAPTURE_WIREFRAMES === '1') {
    const screenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-cadastro-mobile-preview.png'),
      Buffer.from(screenshot.data, 'base64'),
    )
  }
  snapshots.push(await pageSnapshot('Cadastro mobile'))

  await type(`input:not([type='email']):not([type='password'])`, 'Pessoa A')
  await type(`input[type='email']`, 'usabilidade.a@example.test')
  await type(`input[type='password']`, 'teste123')
  await evaluate(`document.querySelector('form').requestSubmit()`)
  await waitForExpression(`document.querySelector('.connect-card') !== null`)
  if (process.env.CAPTURE_WIREFRAMES === '1') {
    const screenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-conectar-mobile-preview.png'),
      Buffer.from(screenshot.data, 'base64'),
    )
  }
  snapshots.push(await pageSnapshot('Escolha de pareamento mobile'))
  await clickText('Criar e receber código')
  await waitForExpression(`document.querySelector('.pairing-waiting') !== null`)
  if (process.env.CAPTURE_WIREFRAMES === '1') {
    const screenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-convite-mobile-preview.png'),
      Buffer.from(screenshot.data, 'base64'),
    )
  }
  snapshots.push(await pageSnapshot('Espera do convite mobile'))

  const code = await evaluate(`document.querySelector('.pairing-code strong').textContent.trim()`)
  const ownerToken = await evaluate(`localStorage.getItem('entrenos-token')`)
  const partner = await jsonRequest('/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Pessoa B',
      email: 'usabilidade.b@example.test',
      password: 'teste123',
    }),
  })
  await jsonRequest('/couples/join', {
    method: 'POST',
    headers: { Authorization: `Bearer ${partner.token}` },
    body: JSON.stringify({ code }),
  })
  await clickText('Já usaram o código')
  await waitForExpression(`document.querySelector('.daily-card') !== null`)
  if (process.env.CAPTURE_WIREFRAMES === '1') {
    const screenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-home-mobile-preview.png'),
      Buffer.from(screenshot.data, 'base64'),
    )
  }
  snapshots.push(await pageSnapshot('Home pareada mobile'))

  await clickText('Nós')
  await waitForExpression(`document.querySelector('.love-mail') !== null`)
  await type('#love-note', 'Só queria lembrar que amo construir nossos dias ao seu lado.')
  await evaluate(`document.querySelector('.love-note-composer').requestSubmit()`)
  await waitForExpression(`document.querySelector('.love-note-list article.mine') !== null`)
  const partnerMail = await jsonRequest('/love-notes', {
    headers: { Authorization: `Bearer ${partner.token}` },
  })
  if (!partnerMail.notes?.some((note) => !note.mine && note.text.includes('construir nossos dias')))
    throw new Error('O recado não ficou disponível para a conta parceira')
  if (process.env.CAPTURE_WIREFRAMES === '1') {
    const screenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-correio-mobile-preview.png'),
      Buffer.from(screenshot.data, 'base64'),
    )
  }
  snapshots.push(await pageSnapshot('Correio do Amor mobile'))
  await clickText('Início')
  await waitForExpression(`document.querySelector('.daily-card') !== null`)

  await clickText('Perguntas que aproximam')
  await waitForExpression(`document.querySelector('.game-setup') !== null`)
  const selectedDeepIntensity = await evaluate(`(() => {
    const input = document.querySelector('input[name="question-intensity"][value="deep"]')
    if (!input) return false
    input.click()
    return input.checked
  })()`)
  if (!selectedDeepIntensity) throw new Error('Nível Profunda não encontrado')
  if (process.env.CAPTURE_WIREFRAMES === '1') {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    })
    const desktopScreenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-perguntas-preview.png'),
      Buffer.from(desktopScreenshot.data, 'base64'),
    )
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    })
    const screenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-perguntas-mobile-preview.png'),
      Buffer.from(screenshot.data, 'base64'),
    )
  }
  snapshots.push(await pageSnapshot('Configuração de perguntas mobile'))
  await clickText('Começar jogo')
  await waitForExpression(`document.querySelector('.question-card') !== null`)
  await waitForExpression(
    `document.querySelector('.question-card h2')?.textContent.includes('ter ou não ter filhos')`,
  )
  if (process.env.CAPTURE_WIREFRAMES === '1') {
    const screenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-pergunta-mobile-preview.png'),
      Buffer.from(screenshot.data, 'base64'),
    )
  }
  snapshots.push(await pageSnapshot('Primeira pergunta mobile'))
  await clickText('Sair do jogo')
  await waitForExpression(`document.querySelector('.daily-card') !== null`)

  await clickText('Perguntas que aproximam')
  await waitForExpression(`document.querySelector('.game-setup') !== null`)
  const selectedMultipleChoice = await evaluate(`(() => {
    const input = document.querySelector('input[name="game-mode"][value="multipleChoice"]')
    if (!input) return false
    input.click()
    return input.checked
  })()`)
  if (!selectedMultipleChoice) throw new Error('Formato Múltipla escolha não encontrado')
  await clickText('Começar jogo')
  await waitForExpression(`document.querySelector('.choice-answer-grid') !== null`)
  await clickText('Uma lembrança')
  await clickText('Confirmar resposta')
  await waitForExpression(
    `document.querySelector('.answer-form h2')?.textContent.includes('Pessoa B')`,
  )
  snapshots.push(await pageSnapshot('Múltipla escolha mobile'))
  await clickText('Sair do jogo')
  await waitForExpression(`document.querySelector('.daily-card') !== null`)

  await clickText('Revelação mútua')
  await waitForExpression(`document.querySelector('.answer-form textarea') !== null`)
  snapshots.push(await pageSnapshot('Resposta privada mobile'))
  await type('.answer-form textarea', 'Construir nossa vida juntos, com calma e parceria.')
  await evaluate(`document.querySelector('.answer-form').requestSubmit()`)
  await waitForExpression(`document.querySelector('.waiting-card') !== null`)
  snapshots.push(await pageSnapshot('Espera da resposta mobile'))
  await jsonRequest('/answers/question-3', {
    method: 'POST',
    headers: { Authorization: `Bearer ${partner.token}` },
    body: JSON.stringify({ text: 'Viajar e criar novas memórias lado a lado.' }),
  })
  await clickText('Atualizar status')
  await waitForExpression(`document.querySelector('.reveal-grid') !== null`)
  snapshots.push(await pageSnapshot('Revelação bilateral mobile'))

  await clickText('Concluir momento juntos')
  await waitForExpression(`document.querySelector('.daily-card') !== null`)
  await clickText('As linguagens do amor')
  for (let answer = 0; answer < 5; answer += 1) await clickText('A')
  await waitForExpression(`document.querySelector('.result-card') !== null`)
  snapshots.push(await pageSnapshot('Resultado linguagens do amor mobile'))

  await clickText('Voltar ao nosso espaço')
  await clickText('Os 4 temperamentos')
  snapshots.push(await pageSnapshot('Temperamentos mobile'))
  for (let answer = 0; answer < 10; answer += 1) await clickText('A')
  await waitForExpression(`document.querySelector('.temperament-chart') !== null`)
  snapshots.push(await pageSnapshot('Resultado temperamentos mobile'))

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${appPort}/app` })
  await waitForExpression(`document.querySelector('.daily-card') !== null`)
  snapshots.push(await pageSnapshot('Home desktop'))
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${appPort}/wireframes/correio` })
  await waitForExpression(`document.querySelector('.love-mail') !== null`)
  await new Promise((resolveWait) => setTimeout(resolveWait, 500))
  if (process.env.CAPTURE_WIREFRAMES === '1') {
    const screenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-correio-preview.png'),
      Buffer.from(screenshot.data, 'base64'),
    )
  }
  snapshots.push(await pageSnapshot('Correio do Amor desktop'))
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${appPort}/wireframes/perfil` })
  await waitForExpression(`document.querySelector('.connection-card') !== null`)
  await new Promise((resolveWait) => setTimeout(resolveWait, 500))
  if (process.env.CAPTURE_WIREFRAMES === '1') {
    const desktopScreenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-perfil-preview.png'),
      Buffer.from(desktopScreenshot.data, 'base64'),
    )
  }
  snapshots.push(await pageSnapshot('Perfil desktop'))
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  })
  if (process.env.CAPTURE_WIREFRAMES === '1') {
    const mobileScreenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-perfil-mobile-preview.png'),
      Buffer.from(mobileScreenshot.data, 'base64'),
    )
  }
  snapshots.push(await pageSnapshot('Perfil mobile'))
  await cdp.send('Page.navigate', {
    url: `http://127.0.0.1:${appPort}/wireframes/linguagens-do-amor`,
  })
  await waitForExpression(`document.querySelector('.quiz .choices') !== null`)
  await new Promise((resolveWait) => setTimeout(resolveWait, 500))
  if (process.env.CAPTURE_WIREFRAMES === '1') {
    const mobileScreenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-linguagens-do-amor-mobile-preview.png'),
      Buffer.from(mobileScreenshot.data, 'base64'),
    )
  }
  snapshots.push(await pageSnapshot('Linguagens do amor mobile'))
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })
  if (process.env.CAPTURE_WIREFRAMES === '1') {
    const desktopScreenshot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    })
    await writeFile(
      resolve(projectRoot, 'docs/wireframe-linguagens-do-amor-preview.png'),
      Buffer.from(desktopScreenshot.data, 'base64'),
    )
  }
  snapshots.push(await pageSnapshot('Linguagens do amor desktop'))

  const responsePrivacy = await jsonRequest('/answers/question-3', {
    headers: { Authorization: `Bearer ${ownerToken}` },
  })
  console.log(
    JSON.stringify(
      {
        status: 'aprovado_com_ressalvas',
        journeys: {
          onboarding: true,
          registration: true,
          pairing: true,
          loveMail: true,
          multipleChoice: true,
          privateAnswer: true,
          mutualReveal: true,
          loveLanguage: true,
          temperament: true,
        },
        firstKeyboardFocus: firstFocus,
        privacy: {
          bothAnswersRequired: responsePrivacy.complete,
          returnedAnswers: responsePrivacy.answers.length,
          loveNoteVisibleOnlyToCouple: partnerMail.notes.length === 1,
        },
        snapshots,
        browserConsoleOrProcessIssues: consoleIssues.filter(Boolean),
      },
      null,
      2,
    ),
  )
} finally {
  cdp?.close()
  for (const child of processes.reverse()) child.kill()
  await new Promise((resolveWait) => setTimeout(resolveWait, 500))
  await rm(temporaryRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(
    () => undefined,
  )
}

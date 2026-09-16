import { spawn } from 'node:child_process'
import { access, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const appPort = 5176
const apiPort = 8792
const debugPort = 9334
const temporaryRoot = await mkdtemp(join(tmpdir(), 'conectadois-mobile-mpv-'))
const processes = []
const processIssues = []
const browserIssues = []

const browserCandidates = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
]

const viewports = [
  { name: 'compacto', width: 320, height: 568, deviceScaleFactor: 2 },
  { name: 'Android médio', width: 360, height: 800, deviceScaleFactor: 3 },
  { name: 'iPhone 12/13', width: 390, height: 844, deviceScaleFactor: 3 },
  { name: 'Android amplo', width: 412, height: 915, deviceScaleFactor: 2.625 },
  { name: 'paisagem compacta', width: 667, height: 375, deviceScaleFactor: 2 },
]

async function findBrowser() {
  for (const candidate of browserCandidates) {
    try {
      await access(candidate)
      return candidate
    } catch {
      // Continue procurando entre os navegadores locais conhecidos.
    }
  }
  throw new Error('Microsoft Edge ou Google Chrome não encontrado para a validação mobile.')
}

function start(command, args, env = {}) {
  const child = spawn(command, args, {
    cwd: projectRoot,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  processes.push(child)
  child.stderr.on('data', (chunk) => {
    const message = String(chunk).trim()
    if (
      message &&
      !message.includes('ExperimentalWarning') &&
      !message.includes('DevTools listening') &&
      !message.includes('fallback_task_provider.cc')
    )
      processIssues.push(message)
  })
  return child
}

async function waitFor(url, attempts = 100) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.status > 0) return response
    } catch {
      // O serviço pode estar iniciando; tente novamente até o limite configurado.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 200))
  }
  throw new Error(`Tempo esgotado aguardando ${url}`)
}

function cdpClient(socketUrl) {
  const socket = new WebSocket(socketUrl)
  let nextId = 0
  const pending = new Map()
  const listeners = new Map()

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      const { resolve: resolveCall, reject } = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) reject(new Error(message.error.message))
      else resolveCall(message.result)
      return
    }
    for (const listener of listeners.get(message.method) ?? []) listener(message.params)
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
    on(method, listener) {
      const current = listeners.get(method) ?? []
      listeners.set(method, [...current, listener])
    },
    close: () => socket.close(),
  }
}

let cdp
try {
  const browserPath = await findBrowser()
  const databaseFile = join(temporaryRoot, 'database.json')
  start(process.execPath, ['server/index.mjs'], {
    HOST: '127.0.0.1',
    PORT: String(apiPort),
    DATABASE_FILE: databaseFile,
    APP_ORIGIN: `http://127.0.0.1:${appPort}`,
    MPV_EXPORT_TOKEN: 'teste-exportacao-mpv-1234567890-seguro',
  })
  start(
    process.execPath,
    [
      'node_modules/vite/bin/vite.js',
      '--host',
      '127.0.0.1',
      '--port',
      String(appPort),
      '--strictPort',
    ],
    { API_PROXY_TARGET: `http://127.0.0.1:${apiPort}` },
  )
  start(browserPath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${join(temporaryRoot, 'browser-profile')}`,
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
  const pageTarget = targets.find((target) => target.type === 'page')
  if (!pageTarget) throw new Error('Aba de navegador não encontrada pelo protocolo de depuração.')

  cdp = cdpClient(pageTarget.webSocketDebuggerUrl)
  await cdp.ready
  cdp.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
    browserIssues.push(exceptionDetails.exception?.description ?? exceptionDetails.text)
  })
  cdp.on('Log.entryAdded', ({ entry }) => {
    if (entry.level === 'error') browserIssues.push(entry.text)
  })
  await Promise.all([cdp.send('Page.enable'), cdp.send('Runtime.enable'), cdp.send('Log.enable')])

  async function evaluate(expression) {
    const result = await cdp.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ?? result.exceptionDetails.text,
      )
    }
    return result.result.value
  }

  async function waitForExpression(expression, attempts = 100) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      if (await evaluate(expression)) return
      await new Promise((resolveWait) => setTimeout(resolveWait, 100))
    }
    throw new Error(`Tempo esgotado aguardando: ${expression}`)
  }

  async function setViewport({ width, height, deviceScaleFactor }) {
    await Promise.all([
      cdp.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor,
        mobile: true,
      }),
      cdp.send('Emulation.setTouchEmulationEnabled', {
        enabled: true,
        maxTouchPoints: 5,
      }),
    ])
  }

  async function navigateHome(viewport) {
    await setViewport(viewport)
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${appPort}` })
    await waitForExpression(`document.querySelector('.mpv-game-grid') !== null`)
    await evaluate(
      `window.__mpvConfirmCalls = []; window.__mpvConfirmResult = false; window.confirm = (message) => { window.__mpvConfirmCalls.push(message); return window.__mpvConfirmResult }`,
    )
  }

  async function clickText(text) {
    const encoded = JSON.stringify(text)
    const clicked = await evaluate(`(() => {
      const element = [...document.querySelectorAll('button')].find((item) => item.textContent.includes(${encoded}));
      if (!element) return false;
      element.click();
      return true;
    })()`)
    if (!clicked) throw new Error(`Botão não encontrado: ${text}`)
    await new Promise((resolveWait) => setTimeout(resolveWait, 40))
  }

  async function clickSelector(selector) {
    const encoded = JSON.stringify(selector)
    const clicked = await evaluate(`(() => {
      const element = document.querySelector(${encoded});
      if (!element) return false;
      element.click();
      return true;
    })()`)
    if (!clicked) throw new Error(`Elemento não encontrado: ${selector}`)
    await new Promise((resolveWait) => setTimeout(resolveWait, 40))
  }

  async function type(selector, value) {
    const encodedSelector = JSON.stringify(selector)
    const encodedValue = JSON.stringify(value)
    const changed = await evaluate(`(() => {
      const element = document.querySelector(${encodedSelector});
      if (!(element instanceof HTMLTextAreaElement)) return false;
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      setter.call(element, ${encodedValue});
      element.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`)
    if (!changed) throw new Error(`Campo não encontrado: ${selector}`)
  }

  async function touchSelector(selector) {
    const encoded = JSON.stringify(selector)
    const found = await evaluate(`(() => {
      const element = document.querySelector(${encoded});
      if (!element) return false;
      element.scrollIntoView({ block: 'center', inline: 'center' });
      return true;
    })()`)
    if (!found) throw new Error(`Elemento não encontrado para toque: ${selector}`)
    await new Promise((resolveWait) => setTimeout(resolveWait, 80))
    const point = await evaluate(`(() => {
      const element = document.querySelector(${encoded});
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    })()`)
    if (!point) throw new Error(`Elemento não encontrado para toque: ${selector}`)
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: point.x, y: point.y, radiusX: 4, radiusY: 4, force: 1 }],
    })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await new Promise((resolveWait) => setTimeout(resolveWait, 80))
  }

  async function snapshot(viewportName, label) {
    return evaluate(`(() => {
      const visible = (element) => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && box.width > 0 && box.height > 0;
      };
      const nameOf = (element) => (
        element.getAttribute('aria-label') ||
        element.textContent.trim() ||
        element.getAttribute('placeholder') ||
        element.querySelector('img[alt]')?.alt ||
        element.tagName
      ).replace(/\\s+/g, ' ').slice(0, 70);
      const targets = [
        ...document.querySelectorAll('button, a, input:not([type="radio"]), textarea'),
        ...document.querySelectorAll('label:has(input[type="radio"])'),
      ].filter(visible);
      const smallTargets = targets.map((element) => {
        const box = element.getBoundingClientRect();
        return { name: nameOf(element), width: Math.round(box.width), height: Math.round(box.height) };
      }).filter(({ width, height }) => width < 44 || height < 44);
      const unnamedControls = [...document.querySelectorAll('button, a, input, textarea')]
        .filter(visible)
        .filter((element) => !(
          element.getAttribute('aria-label') ||
          element.textContent.trim() ||
          element.getAttribute('placeholder') ||
          element.querySelector('img[alt]')?.alt ||
          (element instanceof HTMLInputElement && element.labels?.length)
        )).length;
      const overflowElements = [...document.body.querySelectorAll('*')]
        .filter(visible)
        .filter((element) => {
          const box = element.getBoundingClientRect();
          return box.left < -1 || box.right > innerWidth + 1;
        })
        .map((element) => ({
          name: nameOf(element),
          tag: element.tagName,
          left: Math.round(element.getBoundingClientRect().left),
          right: Math.round(element.getBoundingClientRect().right),
        })).slice(0, 10);
      const fontSize = (selector) => {
        const element = document.querySelector(selector);
        return element && visible(element) ? Number.parseFloat(getComputedStyle(element).fontSize) : null;
      };
      const applicationNamePattern = /(conectadois|entre[\\s-]?n[oó]s|app do amor)/i;
      const exposedApplicationName = [
        document.title,
        document.querySelector('meta[name="description"]')?.content || '',
        document.body.innerText,
        ...Object.keys(localStorage),
      ].find((value) => applicationNamePattern.test(value)) || '';
      return {
        viewport: ${JSON.stringify(viewportName)},
        label: ${JSON.stringify(label)},
        size: [innerWidth, innerHeight],
        heading: document.querySelector('h1')?.innerText || '',
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
        documentScrollWidth: document.documentElement.scrollWidth,
        overflowElements,
        unnamedControls,
        smallTargets,
        badgeFontPx: fontSize('.mpv-test-badge'),
        privacyFontPx: fontSize('.mpv-privacy-note'),
        exposedApplicationName,
      };
    })()`)
  }

  async function submitFeedback(suggestion = '') {
    const selected = await evaluate(`(() => {
      const labels = [...document.querySelectorAll('.mpv-signal-options label')]
        .filter((label) => label.querySelector('input[value="yes"]'));
      labels.forEach((label) => label.click());
      return labels.length;
    })()`)
    if (selected !== 3) throw new Error(`Esperados 3 sinais de feedback; encontrados: ${selected}`)
    await type('#mpv-feedback-suggestion', suggestion)
    await clickText('Enviar feedback')
    await waitForExpression(`document.querySelector('.mpv-feedback-success') !== null`)
  }

  const snapshots = []
  const journeys = []

  for (const viewport of viewports) {
    await navigateHome(viewport)
    snapshots.push(await snapshot(viewport.name, 'Seleção de jogos'))

    await touchSelector('.mpv-game-discovery-together')
    await waitForExpression(
      `document.querySelector('#selected-game-title')?.textContent.includes('Descoberta a Dois')`,
    )
    const touchOpenedDiscovery = await evaluate(
      `document.querySelector('#selected-game-title')?.textContent.includes('Descoberta a Dois')`,
    )
    snapshots.push(await snapshot(viewport.name, 'Instruções de Descoberta a Dois'))
    await clickText('Começar Descoberta a Dois')
    snapshots.push(await snapshot(viewport.name, 'Descoberta — rodada 1'))
    const discoveryHasSkip = await evaluate(
      `[...document.querySelectorAll('button')].some((button) => button.textContent.includes('Pular esta pergunta'))`,
    )
    await clickText('Próxima pergunta')
    snapshots.push(await snapshot(viewport.name, 'Descoberta — rodada 2'))
    await clickText('Pular esta pergunta')
    snapshots.push(await snapshot(viewport.name, 'Descoberta — rodada 3 após pulo'))
    await clickText('Concluir jogo')
    await waitForExpression(`document.querySelector('.mpv-feedback-form') !== null`)
    snapshots.push(await snapshot(viewport.name, 'Descoberta — feedback'))
    await submitFeedback(`Mais exemplos de perguntas para ${viewport.name}.`)
    snapshots.push(await snapshot(viewport.name, 'Descoberta — feedback enviado'))
    await clickText('Jogar novamente')
    await waitForExpression(`document.querySelector('.mpv-question-card') !== null`)
    const discoveryRestarted = await evaluate(
      `document.querySelector('.mpv-play-topbar p')?.textContent.includes('1 de 3')`,
    )
    snapshots.push(await snapshot(viewport.name, 'Descoberta — reinício'))
    await clickText('Voltar às instruções')
    const discoveryCancellationPreservedState = await evaluate(
      `Boolean(document.querySelector('.mpv-question-card')) && document.querySelector('.mpv-play-topbar p')?.textContent.includes('1 de 3')`,
    )
    await evaluate(`window.__mpvConfirmResult = true`)
    await clickText('Voltar às instruções')
    const discoveryExit = await evaluate(`({
      cancellationPreservedState: ${JSON.stringify(discoveryCancellationPreservedState)},
      confirmationExited: Boolean(document.querySelector('#selected-game-title')),
      messages: [...window.__mpvConfirmCalls],
    })`)

    await clickText('Escolher outro jogo')
    await clickText('Adivinhe de Mim')
    snapshots.push(await snapshot(viewport.name, 'Instruções de Adivinhe de Mim'))
    await clickText('Começar Adivinhe de Mim')
    snapshots.push(await snapshot(viewport.name, 'Adivinhe — escolha secreta 1'))
    const guessHasSkip = await evaluate(
      `[...document.querySelectorAll('button')].some((button) => button.textContent.toLowerCase().includes('pular'))`,
    )
    await clickSelector('.mpv-option-button')
    await clickText('Pular esta rodada')
    const guessSecretSkipAdvancedAndCleared = await evaluate(
      `document.querySelector('.mpv-play-topbar p')?.textContent.includes('2 de 3') && !document.querySelector('.mpv-option-button.is-selected') && !document.querySelector('.mpv-reveal')`,
    )
    snapshots.push(await snapshot(viewport.name, 'Adivinhe — rodada 2 após pulo secreto'))
    await clickSelector('.mpv-option-button')
    await clickText('Ocultar e passar o celular')
    await waitForExpression(`document.querySelector('.mpv-handoff-card') !== null`)
    snapshots.push(await snapshot(viewport.name, 'Adivinhe — passagem protegida'))

    const rotatedViewport = {
      width: viewport.height,
      height: viewport.width,
      deviceScaleFactor: viewport.deviceScaleFactor,
    }
    await setViewport(rotatedViewport)
    const handoffPreservedAfterRotation = await evaluate(
      `Boolean(document.querySelector('.mpv-handoff-card')) && document.body.textContent.includes('RESPOSTA OCULTA')`,
    )
    snapshots.push(await snapshot(viewport.name, 'Adivinhe — passagem após rotação'))
    await setViewport(viewport)

    await clickText('Estou com o celular')
    snapshots.push(await snapshot(viewport.name, 'Adivinhe — palpite 2'))
    await clickSelector('.mpv-option-button')
    await clickText('Pular esta rodada')
    const guessGuessSkipAdvancedAndCleared = await evaluate(
      `document.querySelector('.mpv-play-topbar p')?.textContent.includes('3 de 3') && !document.querySelector('.mpv-option-button.is-selected') && !document.querySelector('.mpv-reveal')`,
    )
    snapshots.push(await snapshot(viewport.name, 'Adivinhe — rodada 3 após pulo do palpite'))
    await clickSelector('.mpv-option-button')
    await clickText('Ocultar e passar o celular')
    await waitForExpression(`document.querySelector('.mpv-handoff-card') !== null`)
    await clickText('Estou com o celular')
    await clickSelector('.mpv-option-button')
    await clickText('Revelar resposta')
    snapshots.push(await snapshot(viewport.name, 'Adivinhe — revelação 3'))
    await clickText('Concluir jogo')
    await waitForExpression(`document.querySelector('.mpv-feedback-form') !== null`)
    snapshots.push(await snapshot(viewport.name, 'Adivinhe — feedback'))
    await submitFeedback()
    snapshots.push(await snapshot(viewport.name, 'Adivinhe — feedback enviado'))
    await clickText('Jogar novamente')
    await waitForExpression(`document.querySelector('.mpv-question-card') !== null`)
    const guessRestarted = await evaluate(
      `document.querySelector('.mpv-play-topbar p')?.textContent.includes('1 de 3')`,
    )
    snapshots.push(await snapshot(viewport.name, 'Adivinhe — reinício'))
    await clickSelector('.mpv-option-button')
    await evaluate(`window.__mpvConfirmResult = false`)
    await clickSelector('.mpv-logo-button')
    const logoCancellationPreservedState = await evaluate(
      `Boolean(document.querySelector('.mpv-question-card')) && Boolean(document.querySelector('.mpv-option-button.is-selected')) && document.querySelector('.mpv-play-topbar p')?.textContent.includes('1 de 3')`,
    )
    await evaluate(`window.__mpvConfirmResult = true`)
    await clickSelector('.mpv-logo-button')
    const logoExit = await evaluate(`({
      cancellationPreservedState: ${JSON.stringify(logoCancellationPreservedState)},
      confirmationExited: Boolean(document.querySelector('.mpv-game-grid')),
      messages: [...window.__mpvConfirmCalls],
    })`)

    journeys.push({
      viewport: viewport.name,
      size: [viewport.width, viewport.height],
      touchOpenedDiscovery,
      discoveryHasSkip,
      discoveryRestarted,
      discoveryExit,
      guessHasSkip,
      guessSecretSkipAdvancedAndCleared,
      guessGuessSkipAdvancedAndCleared,
      handoffPreservedAfterRotation,
      guessRestarted,
      logoExit,
    })
  }

  const feedbackDatabase = JSON.parse(await readFile(databaseFile, 'utf8'))
  const feedbackRecords = Array.isArray(feedbackDatabase.mpvFeedback)
    ? feedbackDatabase.mpvFeedback
    : []
  const feedbackSuggestionValid =
    feedbackRecords.length === viewports.length * 2 &&
    feedbackRecords.every(
      (record) => typeof record.suggestion === 'string' && record.suggestion.length <= 500,
    ) &&
    feedbackRecords.filter((record) => record.suggestion.length > 0).length === viewports.length
  const overflowSnapshots = snapshots.filter(
    (item) => item.horizontalOverflow || item.overflowElements.length > 0,
  )
  const smallTargets = snapshots.flatMap((item) =>
    item.smallTargets.map((target) => ({ viewport: item.viewport, state: item.label, ...target })),
  )
  const uniqueSmallTargets = [
    ...new Map(
      smallTargets.map((target) => [
        `${target.name}|${target.width}|${target.height}`,
        { name: target.name, width: target.width, height: target.height },
      ]),
    ).values(),
  ]
  const exitConfirmationFailure = journeys.some(
    (journey) =>
      !journey.discoveryExit.cancellationPreservedState ||
      !journey.discoveryExit.confirmationExited ||
      !journey.logoExit.cancellationPreservedState ||
      !journey.logoExit.confirmationExited ||
      journey.discoveryExit.messages.length !== 2 ||
      journey.logoExit.messages.length !== 4 ||
      journey.logoExit.messages.some((message) => message !== 'Encerrar esta sessão?'),
  )
  const guessSkipFailure = journeys.some(
    (journey) =>
      !journey.guessHasSkip ||
      !journey.guessSecretSkipAdvancedAndCleared ||
      !journey.guessGuessSkipAdvancedAndCleared,
  )
  const targetsUnder44 = uniqueSmallTargets.length > 0
  const applicationNameExposures = snapshots
    .filter((item) => item.exposedApplicationName)
    .map((item) => ({
      viewport: item.viewport,
      state: item.label,
      value: item.exposedApplicationName,
    }))
  const functionalChecksPassed = journeys.every(
    (journey) =>
      journey.touchOpenedDiscovery &&
      journey.discoveryHasSkip &&
      journey.discoveryRestarted &&
      journey.guessSecretSkipAdvancedAndCleared &&
      journey.guessGuessSkipAdvancedAndCleared &&
      journey.handoffPreservedAfterRotation &&
      journey.guessRestarted &&
      journey.discoveryExit.cancellationPreservedState &&
      journey.discoveryExit.confirmationExited &&
      journey.logoExit.cancellationPreservedState &&
      journey.logoExit.confirmationExited,
  )

  console.log(
    JSON.stringify(
      {
        status:
          functionalChecksPassed &&
          overflowSnapshots.length === 0 &&
          !guessSkipFailure &&
          !exitConfirmationFailure &&
          !targetsUnder44 &&
          applicationNameExposures.length === 0 &&
          feedbackSuggestionValid
            ? 'aprovado'
            : 'aprovado_parcialmente',
        browser: browserPath,
        matrix: viewports.map(({ name, width, height }) => ({ name, width, height })),
        totals: {
          viewports: viewports.length,
          statesInspected: snapshots.length,
          feedbackRecords: feedbackRecords.length,
          browserOrProcessIssues: browserIssues.length + processIssues.length,
        },
        criteria: {
          functionalChecksPassed,
          noHorizontalOverflow: overflowSnapshots.length === 0,
          touchWorkedInAllViewports: journeys.every((journey) => journey.touchOpenedDiscovery),
          rotationPreservedStateInAllViewports: journeys.every(
            (journey) => journey.handoffPreservedAfterRotation,
          ),
          restartWorkedInAllViewports: journeys.every(
            (journey) => journey.discoveryRestarted && journey.guessRestarted,
          ),
          discoverySkipAvailableInAllViewports: journeys.every(
            (journey) => journey.discoveryHasSkip,
          ),
          guessSkipWorksInAllViewports: !guessSkipFailure,
          exitConfirmationWorksInAllViewports: !exitConfirmationFailure,
          allActionTargetsAtLeast44Px: !targetsUnder44,
          allControlsNamed: snapshots.every((item) => item.unnamedControls === 0),
          applicationNameHidden: applicationNameExposures.length === 0,
          optionalSuggestionStored: feedbackSuggestionValid,
        },
        findings: {
          guessSkipFailure,
          exitConfirmationFailure,
          targetsUnder44: uniqueSmallTargets,
          overflowSnapshots,
          applicationNameExposures,
          feedbackSuggestionFailure: !feedbackSuggestionValid,
        },
        typography: {
          badgeMinimumPx: Math.min(...snapshots.map((item) => item.badgeFontPx).filter(Boolean)),
          privacyMinimumPx: Math.min(
            ...snapshots.map((item) => item.privacyFontPx).filter(Boolean),
          ),
        },
        journeys,
        browserIssues,
        processIssues,
      },
      null,
      2,
    ),
  )
} finally {
  cdp?.close()
  for (const child of processes.reverse()) child.kill()
  await new Promise((resolveWait) => setTimeout(resolveWait, 400))
  await rm(temporaryRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(
    () => undefined,
  )
}

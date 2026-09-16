import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const port = 8795
const baseUrl = `http://127.0.0.1:${port}`
const temporaryRoot = await mkdtemp(join(tmpdir(), 'mpv-production-'))
const databaseFile = join(temporaryRoot, 'database.json')
const exportToken = 'teste-producao-mpv-1234567890-seguro'
const processIssues = []
let server

function expect(condition, message) {
  if (!condition) throw new Error(message)
}

async function waitFor(url, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // O processo pode ainda estar iniciando.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100))
  }
  throw new Error(`Tempo esgotado aguardando ${url}`)
}

try {
  server = spawn(process.execPath, ['server/index.mjs'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: String(port),
      STATIC_DIR: join(projectRoot, 'dist'),
      DATABASE_FILE: databaseFile,
      MPV_EXPORT_TOKEN: exportToken,
      MPV_FEEDBACK_RETENTION_DAYS: '90',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  server.stderr.on('data', (chunk) => processIssues.push(String(chunk).trim()))
  await waitFor(`${baseUrl}/api/health`)

  const home = await fetch(baseUrl)
  const html = await home.text()
  expect(home.status === 200, 'A página inicial deveria responder 200.')
  expect(home.headers.get('content-type')?.startsWith('text/html'), 'A página deveria ser HTML.')
  expect(
    home.headers.get('x-robots-tag')?.includes('noindex'),
    'A página deveria bloquear indexação.',
  )
  expect(
    !html.toLowerCase().includes('conectadois'),
    'O nome do aplicativo não pode aparecer no teste.',
  )

  const assetPath = html.match(/<script[^>]+src="([^"]+)"/)?.[1]
  expect(assetPath, 'O build deveria referenciar o JavaScript compilado.')
  const asset = await fetch(`${baseUrl}${assetPath}`)
  expect(asset.status === 200, 'O arquivo compilado deveria estar disponível.')
  expect(
    asset.headers.get('cache-control')?.includes('immutable'),
    'Arquivos versionados deveriam usar cache imutável.',
  )

  const spaFallback = await fetch(`${baseUrl}/teste-controlado`)
  expect(
    spaFallback.status === 200 && spaFallback.headers.get('content-type')?.startsWith('text/html'),
    'A navegação do frontend deveria usar fallback da SPA.',
  )

  const unknownApi = await fetch(`${baseUrl}/api/inexistente`)
  expect(unknownApi.status >= 400, 'Rota desconhecida da API deveria falhar.')
  expect(
    unknownApi.headers.get('content-type')?.startsWith('application/json'),
    'Rota desconhecida da API não pode retornar o HTML da SPA.',
  )

  const hostilePreflight = await fetch(`${baseUrl}/api/mpv/feedback`, {
    method: 'OPTIONS',
    headers: { Origin: 'https://hostil.example' },
  })
  expect(hostilePreflight.status === 403, 'Preflight de origem hostil deveria ser rejeitado.')

  const created = await fetch(`${baseUrl}/api/mpv/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: baseUrl },
    body: JSON.stringify({
      submissionId: 'feedback-production-000001',
      gameId: 'discovery-together',
      clarity: 'yes',
      connection: 'yes',
      replayIntent: 'yes',
      suggestion: 'Fluxo de produção validado.',
    }),
  })
  expect(created.status === 201, 'Feedback no serviço integrado deveria ser armazenado.')

  const exported = await fetch(`${baseUrl}/api/mpv/feedback/export`, {
    headers: { Authorization: `Bearer ${exportToken}` },
  })
  const csv = await exported.text()
  expect(
    exported.status === 200 && csv.includes('Fluxo de produção validado.'),
    'CSV deveria conter o feedback.',
  )

  const database = JSON.parse(await readFile(databaseFile, 'utf8'))
  expect(database.mpvFeedback?.length === 1, 'O armazenamento deveria conter um feedback.')
  expect(processIssues.length === 0, `Serviço registrou erros: ${processIssues.join(' | ')}`)

  console.log(
    JSON.stringify(
      {
        status: 'aprovado',
        checks: {
          integratedFrontendAndApi: true,
          healthEndpoint: true,
          noIndexHeaders: true,
          applicationNameHidden: true,
          staticAssetCache: true,
          spaFallbackSeparatedFromApi: true,
          restrictedCors: true,
          feedbackPersistenceAndExport: true,
        },
      },
      null,
      2,
    ),
  )
} finally {
  server?.kill()
  await new Promise((resolveWait) => setTimeout(resolveWait, 300))
  await rm(temporaryRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
}

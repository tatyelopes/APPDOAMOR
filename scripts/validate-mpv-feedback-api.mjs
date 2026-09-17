import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const apiPort = 8793
const temporaryRoot = await mkdtemp(join(tmpdir(), 'mpv-feedback-api-'))
const databaseFile = join(temporaryRoot, 'database.json')
const exportToken = 'teste-exportacao-api-1234567890-seguro'
const processIssues = []
let server

async function waitFor(url, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.status > 0) return
    } catch {
      // A API pode ainda estar iniciando.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100))
  }
  throw new Error(`Tempo esgotado aguardando ${url}`)
}

async function api(path, options = {}) {
  return fetch(`http://127.0.0.1:${apiPort}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
}

function expect(condition, message) {
  if (!condition) throw new Error(message)
}

try {
  server = spawn(process.execPath, ['server/index.mjs'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: String(apiPort),
      DATABASE_FILE: databaseFile,
      APP_ORIGIN: 'https://teste.example',
      MPV_EXPORT_TOKEN: exportToken,
      MPV_FEEDBACK_RETENTION_DAYS: '90',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  server.stderr.on('data', (chunk) => processIssues.push(String(chunk).trim()))
  await waitFor(`http://127.0.0.1:${apiPort}/api/me`)

  const payload = {
    submissionId: 'feedback-test-000000000001',
    gameId: 'discovery-together',
    clarity: 'yes',
    connection: 'yes',
    replayIntent: 'no',
    suggestion: '=2+2',
  }

  const created = await api('/api/mpv/feedback', {
    method: 'POST',
    headers: { Origin: 'https://teste.example' },
    body: JSON.stringify(payload),
  })
  const createdBody = await created.json()
  expect(created.status === 201 && createdBody.duplicate === false, 'Criação deveria retornar 201.')

  const duplicate = await api('/api/mpv/feedback', {
    method: 'POST',
    headers: { Origin: 'https://teste.example' },
    body: JSON.stringify(payload),
  })
  const duplicateBody = await duplicate.json()
  expect(
    duplicate.status === 200 && duplicateBody.duplicate === true,
    'Reenvio idempotente deveria retornar o registro existente.',
  )

  const loveStyleCreated = await api('/api/mpv/feedback', {
    method: 'POST',
    headers: { Origin: 'https://teste.example' },
    body: JSON.stringify({
      ...payload,
      submissionId: 'feedback-test-000000000006',
      gameId: 'love-style-sample',
      suggestion: 'Amostra autoral validada.',
    }),
  })
  expect(loveStyleCreated.status === 201, 'A nova amostra deveria aceitar feedback.')

  const invalidGame = await api('/api/mpv/feedback', {
    method: 'POST',
    body: JSON.stringify({ ...payload, submissionId: 'feedback-test-000000000002', gameId: 'x' }),
  })
  expect(invalidGame.status === 400, 'Jogo inválido deveria ser rejeitado.')

  const invalidSignal = await api('/api/mpv/feedback', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      submissionId: 'feedback-test-000000000003',
      clarity: 'maybe',
    }),
  })
  expect(invalidSignal.status === 400, 'Sinal inválido deveria ser rejeitado.')

  const longSuggestion = await api('/api/mpv/feedback', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      submissionId: 'feedback-test-000000000004',
      suggestion: 'x'.repeat(501),
    }),
  })
  expect(longSuggestion.status === 400, 'Sugestão acima de 500 caracteres deveria ser rejeitada.')

  const hostileOrigin = await api('/api/mpv/feedback', {
    method: 'POST',
    headers: { Origin: 'https://hostil.example' },
    body: JSON.stringify({ ...payload, submissionId: 'feedback-test-000000000005' }),
  })
  expect(hostileOrigin.status === 403, 'Origem não autorizada deveria ser rejeitada.')

  const forbiddenExport = await api('/api/mpv/feedback/export', { method: 'GET' })
  expect(forbiddenExport.status === 403, 'Exportação sem token deveria ser negada.')

  const exported = await api('/api/mpv/feedback/export', {
    method: 'GET',
    headers: { Authorization: `Bearer ${exportToken}` },
  })
  const csv = await exported.text()
  expect(exported.status === 200, 'Exportação autorizada deveria retornar 200.')
  expect(
    exported.headers.get('content-type')?.startsWith('text/csv'),
    'Exportação deveria retornar CSV.',
  )
  expect(csv.includes("'=2+2"), 'Exportação deveria neutralizar fórmulas de planilha.')
  expect(csv.includes('love-style-sample'), 'Exportação deveria incluir a nova amostra.')

  const database = JSON.parse(await readFile(databaseFile, 'utf8'))
  expect(database.mpvFeedback.length === 2, 'Deveriam existir dois registros válidos.')
  expect(!('ip' in database.mpvFeedback[0]), 'Endereço IP não deve ser persistido.')
  expect(processIssues.length === 0, `API registrou erros: ${processIssues.join(' | ')}`)

  console.log(
    JSON.stringify(
      {
        status: 'aprovado',
        checks: {
          anonymousSubmission: true,
          idempotency: true,
          gameAndSignalValidation: true,
          loveStyleSampleAccepted: true,
          suggestionLimit: true,
          originRestriction: true,
          protectedCsvExport: true,
          spreadsheetFormulaNeutralization: true,
          noIpPersistence: true,
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

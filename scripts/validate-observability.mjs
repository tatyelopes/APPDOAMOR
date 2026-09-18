import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const port = 8796
const baseUrl = `http://127.0.0.1:${port}`
const temporaryRoot = await mkdtemp(join(tmpdir(), 'observability-'))
const databaseFile = join(temporaryRoot, 'database.json')
const exportToken = 'teste-observabilidade-1234567890-seguro'
const privateMarker = 'nao-registrar-conteudo-privado@example.com'
const output = []
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
      DATABASE_FILE: databaseFile,
      MPV_EXPORT_TOKEN: exportToken,
      APP_VERSION: 'observability-test',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  server.stdout.on('data', (chunk) => output.push(String(chunk)))
  server.stderr.on('data', (chunk) => output.push(String(chunk)))
  await waitFor(`${baseUrl}/api/health`)

  const health = await fetch(`${baseUrl}/api/health`, {
    headers: { 'X-Request-Id': privateMarker },
  })
  expect(health.status === 200, 'A sonda de vida deveria responder 200.')
  expect(
    /^[a-f0-9-]{36}$/.test(health.headers.get('x-request-id') || ''),
    'Um identificador privado ou inválido não pode ser reutilizado.',
  )

  const ready = await fetch(`${baseUrl}/api/ready`)
  expect(ready.status === 200, 'A sonda de prontidão deveria aprovar o armazenamento válido.')
  expect((await ready.json()).status === 'ready', 'A prontidão deveria retornar estado mínimo.')

  await writeFile(databaseFile, '{invalido', 'utf8')
  const notReady = await fetch(`${baseUrl}/api/ready`)
  expect(notReady.status === 503, 'A prontidão deveria detectar armazenamento inválido.')
  expect(
    (await notReady.json()).status === 'not_ready',
    'A falha de prontidão não deveria expor detalhes internos.',
  )
  await writeFile(databaseFile, '{}', 'utf8')

  const forbiddenMetrics = await fetch(`${baseUrl}/api/ops/metrics`)
  expect(forbiddenMetrics.status === 403, 'Métricas sem autenticação deveriam ser negadas.')

  await fetch(`${baseUrl}/api/mpv/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ suggestion: privateMarker }),
  })

  const metricsResponse = await fetch(`${baseUrl}/api/ops/metrics`, {
    headers: { Authorization: `Bearer ${exportToken}` },
  })
  const metrics = await metricsResponse.json()
  expect(metricsResponse.status === 200, 'Métricas autorizadas deveriam responder 200.')
  expect(metrics.requests.total >= 5, 'As requisições deveriam ser contabilizadas.')
  expect(metrics.readiness.checks === 2, 'As duas verificações de prontidão deveriam ser medidas.')
  expect(metrics.readiness.failures === 1, 'A falha de armazenamento deveria ser contabilizada.')
  expect(metrics.process.rssBytes > 0, 'A capacidade do processo deveria ser medida.')

  await new Promise((resolveWait) => setTimeout(resolveWait, 100))
  const logText = output.join('')
  const logLines = logText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const entries = logLines.map((line) => JSON.parse(line))
  expect(
    entries.some((entry) => entry.event === 'service_started'),
    'Início deveria ser registrado.',
  )
  expect(
    entries.some((entry) => entry.event === 'http_request'),
    'Requisições deveriam ser registradas.',
  )
  expect(
    entries.some((entry) => entry.event === 'storage_readiness_failed'),
    'Falha do armazenamento deveria ser registrada.',
  )
  expect(!logText.includes(privateMarker), 'Logs não podem conter corpo, e-mail ou sugestão.')
  expect(!logText.includes(exportToken), 'Logs não podem conter segredo operacional.')

  const workflow = await readFile(join(projectRoot, '.github/workflows/monitor.yml'), 'utf8')
  expect(workflow.includes("cron: '*/15 * * * *'"), 'Monitor deveria executar a cada 15 minutos.')
  expect(workflow.includes('/api/ready'), 'Monitor deveria consultar a prontidão do banco.')
  expect(workflow.includes('issues: write'), 'Monitor deveria poder abrir o alerta operacional.')
  expect(workflow.includes('actions/github-script@v9'), 'Automação de issues deveria estar fixada.')
  expect(
    workflow.includes("steps.readiness.outcome == 'success'") &&
      workflow.includes("state_reason: 'completed'"),
    'Monitor deveria encerrar o alerta depois da recuperação.',
  )

  console.log(
    JSON.stringify(
      {
        status: 'aprovado',
        checks: {
          structuredLogs: true,
          privateContentExcluded: true,
          livenessAndReadinessSeparated: true,
          storageFailureDetected: true,
          protectedMetrics: true,
          requestAndCapacityMetrics: true,
          scheduledAlertWorkflow: true,
          automaticRecoveryClosure: true,
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

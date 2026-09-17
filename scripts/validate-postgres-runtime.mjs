import { spawn } from 'node:child_process'
import pg from 'pg'

const databaseUrl = String(process.env.DATABASE_URL || '').trim()
if (!databaseUrl) throw new Error('DATABASE_URL é obrigatória para validar o runtime PostgreSQL.')

const port = 8796
const baseUrl = `http://127.0.0.1:${port}`
const origin = 'https://runtime-postgres.example'
const exportToken = 'teste-runtime-postgres-token-com-32-caracteres'
const submissionId = 'database-runtime-validation-0001'
const processIssues = []
let server

function expect(condition, message) {
  if (!condition) throw new Error(message)
}

async function waitFor(url, attempts = 150) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // O servidor ainda pode estar aplicando as migrações.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100))
  }
  throw new Error(`Tempo esgotado aguardando ${url}. ${processIssues.join(' | ')}`)
}

const pool = new pg.Pool({ connectionString: databaseUrl, max: 1 })
try {
  server = spawn(process.execPath, ['server/index.mjs'], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: String(port),
      APP_ORIGIN: origin,
      MPV_EXPORT_TOKEN: exportToken,
      DATABASE_URL: databaseUrl,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  server.stderr.on('data', (chunk) => processIssues.push(String(chunk).trim()))
  await waitFor(`${baseUrl}/api/health`)

  const created = await fetch(`${baseUrl}/api/mpv/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({
      submissionId,
      gameId: 'love-style-sample',
      clarity: 'yes',
      connection: 'yes',
      replayIntent: 'yes',
      suggestion: 'Teste sintético do runtime PostgreSQL.',
    }),
  })
  expect(
    created.status === 201,
    `Feedback PostgreSQL deveria retornar 201; retornou ${created.status}.`,
  )

  const exported = await fetch(`${baseUrl}/api/mpv/feedback/export`, {
    headers: { Authorization: `Bearer ${exportToken}` },
  })
  const csv = await exported.text()
  expect(
    exported.status === 200,
    `Exportação PostgreSQL deveria retornar 200; retornou ${exported.status}.`,
  )
  expect(
    csv.includes('Teste sintético do runtime PostgreSQL.'),
    'A exportação deveria conter o registro sintético.',
  )

  const migrationCount = await pool.query(
    'SELECT count(*)::integer AS count FROM schema_migrations',
  )
  expect(migrationCount.rows[0].count === 2, 'O startup deveria aplicar as duas migrações.')
  expect(processIssues.length === 0, `Runtime registrou erros: ${processIssues.join(' | ')}`)

  console.log(
    JSON.stringify(
      {
        status: 'aprovado',
        checks: {
          automaticMigrationsBeforeListen: true,
          healthAfterMigration: true,
          postgresFeedbackWrite: true,
          protectedPostgresExport: true,
        },
      },
      null,
      2,
    ),
  )
} finally {
  server?.kill()
  await pool
    .query('DELETE FROM mpv_feedback WHERE submission_id = $1', [submissionId])
    .catch(() => undefined)
  await pool.end()
}

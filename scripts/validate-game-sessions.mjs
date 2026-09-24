import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const tempDirectory = await mkdtemp(join(tmpdir(), 'conectadois-game-sessions-'))
const databaseFile = join(tempDirectory, 'database.json')
const port = 8797
const baseUrl = `http://127.0.0.1:${port}`
const issues = []
let server

function expect(condition, message) {
  if (!condition) throw new Error(message)
}

async function waitForHealth() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`)
      if (response.ok) return
    } catch {
      // O processo ainda pode estar iniciando.
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  throw new Error(`Servidor não iniciou: ${issues.join(' | ')}`)
}

async function request(path, { token = '', headers = {}, ...options } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })
  const data = await response.json()
  return { response, data }
}

async function register(name, email) {
  const result = await request('/api/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password: 'senha-segura-local' }),
  })
  expect(result.response.status === 201, `Cadastro de ${email} falhou.`)
  return result.data
}

try {
  server = spawn(process.execPath, ['server/index.mjs'], {
    env: {
      ...process.env,
      NODE_ENV: 'test',
      HOST: '127.0.0.1',
      PORT: String(port),
      DATABASE_FILE: databaseFile,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  server.stderr.on('data', (chunk) => issues.push(String(chunk).trim()))
  await waitForHealth()

  const first = await register('Pessoa Um', 'pessoa1@sessoes.example.test')
  const createdCouple = await request('/api/couples/create', {
    method: 'POST',
    token: first.token,
    body: JSON.stringify({ anniversary: '2024-02-14' }),
  })
  expect(createdCouple.response.status === 201, 'A primeira conta deveria criar o casal.')

  const second = await register('Pessoa Dois', 'pessoa2@sessoes.example.test')
  const joinedCouple = await request('/api/couples/join', {
    method: 'POST',
    token: second.token,
    body: JSON.stringify({ code: createdCouple.data.user.couple.code }),
  })
  expect(joinedCouple.response.status === 200, 'A segunda conta deveria entrar no casal.')

  const key = randomUUID()
  const payload = { mode: 'mixed', roundCount: 2, themes: ['Carinho'] }
  const created = await request('/api/v1/game-sessions', {
    method: 'POST',
    token: first.token,
    headers: { 'Idempotency-Key': key },
    body: JSON.stringify(payload),
  })
  expect(created.response.status === 201, 'Criar partida deveria retornar 201.')
  expect(created.data.data.rounds.length === 2, 'A partida deveria congelar duas rodadas.')
  expect(
    created.response.headers.get('location')?.endsWith(created.data.data.id),
    'A resposta deveria informar a localização da partida.',
  )

  const duplicate = await request('/api/v1/game-sessions', {
    method: 'POST',
    token: first.token,
    headers: { 'Idempotency-Key': key },
    body: JSON.stringify(payload),
  })
  expect(duplicate.response.status === 201, 'Repetir a intenção deveria manter a resposta 201.')
  expect(
    duplicate.data.data.id === created.data.data.id,
    'A repetição não deveria duplicar a partida.',
  )

  const conflict = await request('/api/v1/game-sessions', {
    method: 'POST',
    token: first.token,
    headers: { 'Idempotency-Key': key },
    body: JSON.stringify({ ...payload, roundCount: 1 }),
  })
  expect(conflict.response.status === 409, 'Reutilizar a chave com outro pedido deveria falhar.')

  const resumed = await request(`/api/v1/game-sessions/${created.data.data.id}`, {
    token: second.token,
  })
  expect(resumed.response.status === 200, 'A outra conta do casal deveria retomar a partida.')
  expect(resumed.data.data.id === created.data.data.id, 'A retomada deveria preservar a partida.')

  const outsider = await register('Pessoa Externa', 'externa@sessoes.example.test')
  const forbidden = await request(`/api/v1/game-sessions/${created.data.data.id}`, {
    token: outsider.token,
  })
  expect(forbidden.response.status === 403, 'Outra conta não deveria acessar a partida.')

  const invalid = await request('/api/v1/game-sessions', {
    method: 'POST',
    token: first.token,
    body: JSON.stringify(payload),
  })
  expect(invalid.response.status === 422, 'Criar sem chave idempotente deveria falhar.')

  const stored = JSON.parse(await readFile(databaseFile, 'utf8'))
  expect(stored.gameSessions.length === 1, 'A partida deveria persistir uma única vez.')
  expect(stored.sessionParticipants.length === 2, 'Os dois participantes deveriam ser persistidos.')
  expect(stored.sessionRounds.length === 2, 'As duas rodadas deveriam ser persistidas.')
  expect(issues.length === 0, `O servidor registrou erros: ${issues.join(' | ')}`)

  console.log(
    JSON.stringify(
      {
        status: 'aprovado',
        checks: {
          authenticatedCreation: true,
          contentSnapshots: true,
          idempotentRetry: true,
          conflictingRetryRejected: true,
          partnerResume: true,
          coupleIsolation: true,
          persistedParticipantsAndRounds: true,
        },
      },
      null,
      2,
    ),
  )
} finally {
  server?.kill()
  await new Promise((resolve) => setTimeout(resolve, 100))
  await rm(tempDirectory, { recursive: true, force: true })
}

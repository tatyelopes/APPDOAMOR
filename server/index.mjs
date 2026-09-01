import { createServer } from 'node:http'
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const dataFile = join(root, 'data', 'database.json')
const emptyDb = { users: [], couples: [], sessions: [], answers: [] }

function loadDb() {
  if (!existsSync(dataFile)) return structuredClone(emptyDb)
  try { return { ...structuredClone(emptyDb), ...JSON.parse(readFileSync(dataFile, 'utf8')) } } catch { return structuredClone(emptyDb) }
}
function saveDb(db) {
  mkdirSync(dirname(dataFile), { recursive: true })
  writeFileSync(dataFile, JSON.stringify(db, null, 2))
}
function passwordHash(password, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}
function passwordMatches(password, stored) {
  const [salt, expected] = stored.split(':')
  return timingSafeEqual(Buffer.from(expected, 'hex'), scryptSync(password, salt, 64))
}
function publicUser(user, db) {
  const couple = db.couples.find(item => item.id === user.coupleId)
  const partnerId = couple?.members.find(id => id !== user.id)
  const partner = db.users.find(item => item.id === partnerId)
  return { id: user.id, name: user.name, email: user.email, couple: couple ? { id: couple.id, code: couple.code, anniversary: couple.anniversary, partner: partner ? { id: partner.id, name: partner.name } : null } : null }
}
function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' })
  res.end(JSON.stringify(body))
}
async function body(req) {
  let content = ''
  for await (const chunk of req) { content += chunk; if (content.length > 100_000) throw new Error('Payload muito grande') }
  return content ? JSON.parse(content) : {}
}
function auth(req, db) {
  const token = req.headers.authorization?.replace(/^Bearer /, '')
  const session = db.sessions.find(item => item.token === token && item.expiresAt > Date.now())
  return session ? db.users.find(item => item.id === session.userId) : null
}
function code() { return `AMOR-${randomBytes(2).toString('hex').toUpperCase()}` }

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {})
  const db = loadDb()
  try {
    if (req.method === 'POST' && req.url === '/api/register') {
      const input = await body(req)
      const email = String(input.email || '').trim().toLowerCase()
      if (!input.name?.trim() || !email || String(input.password || '').length < 6) return send(res, 400, { error: 'Preencha nome, e-mail e uma senha de pelo menos 6 caracteres.' })
      if (db.users.some(user => user.email === email)) return send(res, 409, { error: 'Este e-mail já está cadastrado.' })
      const user = { id: randomUUID(), name: input.name.trim(), email, password: passwordHash(input.password), coupleId: null }
      const token = randomBytes(32).toString('hex')
      db.users.push(user); db.sessions.push({ token, userId: user.id, expiresAt: Date.now() + 30 * 864e5 }); saveDb(db)
      return send(res, 201, { token, user: publicUser(user, db) })
    }
    if (req.method === 'POST' && req.url === '/api/login') {
      const input = await body(req)
      const user = db.users.find(item => item.email === String(input.email || '').trim().toLowerCase())
      if (!user || !passwordMatches(String(input.password || ''), user.password)) return send(res, 401, { error: 'E-mail ou senha incorretos.' })
      const token = randomBytes(32).toString('hex'); db.sessions.push({ token, userId: user.id, expiresAt: Date.now() + 30 * 864e5 }); saveDb(db)
      return send(res, 200, { token, user: publicUser(user, db) })
    }
    const user = auth(req, db)
    if (!user) return send(res, 401, { error: 'Sessão inválida ou expirada.' })
    if (req.method === 'GET' && req.url === '/api/me') return send(res, 200, { user: publicUser(user, db) })
    if (req.method === 'POST' && req.url === '/api/couples/create') {
      if (user.coupleId) return send(res, 409, { error: 'Você já está em um casal.' })
      const input = await body(req); let invite = code(); while (db.couples.some(item => item.code === invite)) invite = code()
      const couple = { id: randomUUID(), code: invite, anniversary: input.anniversary || '', members: [user.id] }
      user.coupleId = couple.id; db.couples.push(couple); saveDb(db)
      return send(res, 201, { user: publicUser(user, db) })
    }
    if (req.method === 'POST' && req.url === '/api/couples/join') {
      if (user.coupleId) return send(res, 409, { error: 'Você já está em um casal.' })
      const input = await body(req); const couple = db.couples.find(item => item.code === String(input.code || '').trim().toUpperCase())
      if (!couple) return send(res, 404, { error: 'Código de convite não encontrado.' })
      if (couple.members.length >= 2) return send(res, 409, { error: 'Este casal já possui dois participantes.' })
      couple.members.push(user.id); user.coupleId = couple.id; saveDb(db)
      return send(res, 200, { user: publicUser(user, db) })
    }
    if (req.method === 'GET' && req.url?.startsWith('/api/answers/')) {
      if (!user.coupleId) return send(res, 400, { error: 'Conecte-se ao seu amor primeiro.' })
      const questionId = decodeURIComponent(req.url.split('/').pop())
      const coupleAnswers = db.answers.filter(item => item.coupleId === user.coupleId && item.questionId === questionId)
      const complete = coupleAnswers.length >= 2
      return send(res, 200, { complete, mine: coupleAnswers.find(item => item.userId === user.id)?.text || '', answers: complete ? coupleAnswers.map(item => ({ name: db.users.find(u => u.id === item.userId)?.name, text: item.text })) : [] })
    }
    if (req.method === 'POST' && req.url?.startsWith('/api/answers/')) {
      if (!user.coupleId) return send(res, 400, { error: 'Conecte-se ao seu amor primeiro.' })
      const questionId = decodeURIComponent(req.url.split('/').pop()); const input = await body(req); const text = String(input.text || '').trim()
      if (!text || text.length > 500) return send(res, 400, { error: 'A resposta deve ter entre 1 e 500 caracteres.' })
      const found = db.answers.find(item => item.coupleId === user.coupleId && item.questionId === questionId && item.userId === user.id)
      if (found) found.text = text; else db.answers.push({ id: randomUUID(), coupleId: user.coupleId, questionId, userId: user.id, text })
      saveDb(db); return send(res, 200, { ok: true })
    }
    send(res, 404, { error: 'Rota não encontrada.' })
  } catch (error) { send(res, 500, { error: error instanceof Error ? error.message : 'Erro interno.' }) }
})

server.listen(8787, '0.0.0.0', () => console.log('API disponível em http://localhost:8787'))

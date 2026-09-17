import { createServer } from 'node:http'
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, resolve, sep } from 'node:path'
import { config } from './src/config.js'
import { loadDatabase as loadDb, saveDatabase as saveDb } from './src/infra/database.js'
import { applyMigrations } from './src/infra/migrations.js'
import {
  listPostgresFeedback,
  storePostgresFeedback,
  usesPostgresFeedback,
} from './src/infra/mpv-feedback-postgres.js'
import {
  hashPassword as passwordHash,
  matchesPassword as passwordMatches,
} from './src/shared/security.js'
import { buildMetrics, clientEventNames, recordEvent } from './src/analytics.js'

const feedbackGames = new Set(['discovery-together', 'guess-about-me', 'love-style-sample'])
const feedbackSignals = new Set(['yes', 'no'])
const feedbackRateWindows = new Map()

function publicUser(user, db) {
  const couple = db.couples.find((item) => item.id === user.coupleId)
  const partnerId = couple?.members.find((id) => id !== user.id)
  const partner = db.users.find((item) => item.id === partnerId)
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: config.adminEmails.includes(user.email),
    couple: couple
      ? {
          id: couple.id,
          code: couple.code,
          anniversary: couple.anniversary,
          partner: partner ? { id: partner.id, name: partner.name } : null,
        }
      : null,
  }
}
function corsHeaders(req) {
  const origin = String(req.headers.origin || '')
  if (!origin || !config.appOrigins.includes(origin)) return {}
  return { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
}

function send(req, res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'X-Content-Type-Options': 'nosniff',
    ...corsHeaders(req),
  })
  res.end(JSON.stringify(body))
}

function sendCsv(req, res, filename, content) {
  res.writeHead(200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...corsHeaders(req),
  })
  res.end(`\uFEFF${content}`)
}

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

function serveFrontend(req, res, pathname) {
  if (!['GET', 'HEAD'].includes(req.method || '')) return false
  const staticRoot = resolve(config.staticDir)
  if (!existsSync(staticRoot)) return false

  let decodedPath
  try {
    decodedPath = decodeURIComponent(pathname)
  } catch {
    return false
  }

  const requestedPath = decodedPath === '/' ? '/index.html' : decodedPath
  const candidate = resolve(staticRoot, `.${requestedPath}`)
  const insideStaticRoot = candidate === staticRoot || candidate.startsWith(`${staticRoot}${sep}`)
  const filePath =
    insideStaticRoot && existsSync(candidate) && statSync(candidate).isFile()
      ? candidate
      : resolve(staticRoot, 'index.html')
  if (!existsSync(filePath) || !statSync(filePath).isFile()) return false

  const headers = {
    'Content-Type': contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Content-Length': statSync(filePath).size,
    'Cache-Control': pathname.startsWith('/assets/')
      ? 'public, max-age=31536000, immutable'
      : 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
  }
  res.writeHead(200, headers)
  if (req.method === 'HEAD') return res.end()
  createReadStream(filePath).pipe(res)
  return true
}
async function body(req) {
  let content = ''
  for await (const chunk of req) {
    content += chunk
    if (content.length > 100_000) throw new Error('Payload muito grande')
  }
  return content ? JSON.parse(content) : {}
}
function auth(req, db) {
  const token = req.headers.authorization?.replace(/^Bearer /, '')
  const session = db.sessions.find((item) => item.token === token && item.expiresAt > Date.now())
  return session ? db.users.find((item) => item.id === session.userId) : null
}
function code() {
  return `AMOR-${randomBytes(2).toString('hex').toUpperCase()}`
}

function isAllowedFeedbackOrigin(req) {
  const origin = String(req.headers.origin || '')
  if (!origin) return true
  if (config.appOrigins.length > 0) return config.appOrigins.includes(origin)
  try {
    return new URL(origin).host === req.headers.host
  } catch {
    return false
  }
}

function isFeedbackRateLimited(req, now = Date.now()) {
  const windowMs = 60 * 60 * 1000
  const limit = 20
  const key = req.socket.remoteAddress || 'unknown'
  const attempts = (feedbackRateWindows.get(key) || []).filter((time) => time > now - windowMs)
  if (attempts.length >= limit) {
    feedbackRateWindows.set(key, attempts)
    return true
  }
  feedbackRateWindows.set(key, [...attempts, now])
  return false
}

function validExportToken(req) {
  if (config.mpvExportToken.length < 32) return false
  const provided = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  const expectedBuffer = Buffer.from(config.mpvExportToken)
  const providedBuffer = Buffer.from(provided)
  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  )
}

function csvCell(value) {
  let text = String(value ?? '')
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

function feedbackCsv(records) {
  const header = [
    'id',
    'createdAt',
    'gameId',
    'clarity',
    'connection',
    'replayIntent',
    'suggestion',
  ]
  const rows = records.map((record) => header.map((key) => csvCell(record[key])).join(','))
  return [header.join(','), ...rows].join('\r\n')
}

const server = createServer(async (req, res) => {
  let pathname
  try {
    pathname = new URL(req.url || '/', 'http://localhost').pathname
  } catch {
    return send(req, res, 400, { error: 'Endereço inválido.' })
  }

  if (!pathname.startsWith('/api/')) {
    if (serveFrontend(req, res, pathname)) return
    return send(req, res, 404, { error: 'Página não encontrada.' })
  }

  if (req.method === 'OPTIONS') {
    if (!isAllowedFeedbackOrigin(req))
      return send(req, res, 403, { error: 'Origem não autorizada.' })
    return send(req, res, 204, {})
  }
  if (req.method === 'GET' && pathname === '/api/health')
    return send(req, res, 200, { status: 'ok' })

  try {
    const db = loadDb()
    if (req.method === 'POST' && req.url === '/api/register') {
      const input = await body(req)
      const email = String(input.email || '')
        .trim()
        .toLowerCase()
      if (!input.name?.trim() || !email || String(input.password || '').length < 6)
        return send(req, res, 400, {
          error: 'Preencha nome, e-mail e uma senha de pelo menos 6 caracteres.',
        })
      if (db.users.some((user) => user.email === email))
        return send(req, res, 409, { error: 'Este e-mail já está cadastrado.' })
      const user = {
        id: randomUUID(),
        name: input.name.trim(),
        email,
        password: passwordHash(input.password),
        coupleId: null,
        createdAt: new Date().toISOString(),
      }
      const token = randomBytes(32).toString('hex')
      db.users.push(user)
      db.sessions.push({ token, userId: user.id, expiresAt: Date.now() + 30 * 864e5 })
      recordEvent(db, 'user_registered', user)
      saveDb(db)
      return send(req, res, 201, { token, user: publicUser(user, db) })
    }
    if (req.method === 'POST' && req.url === '/api/login') {
      const input = await body(req)
      const user = db.users.find(
        (item) =>
          item.email ===
          String(input.email || '')
            .trim()
            .toLowerCase(),
      )
      if (!user || !passwordMatches(String(input.password || ''), user.password))
        return send(req, res, 401, { error: 'E-mail ou senha incorretos.' })
      const token = randomBytes(32).toString('hex')
      db.sessions.push({ token, userId: user.id, expiresAt: Date.now() + 30 * 864e5 })
      recordEvent(db, 'user_logged_in', user)
      saveDb(db)
      return send(req, res, 200, { token, user: publicUser(user, db) })
    }
    if (req.method === 'POST' && req.url === '/api/mpv/feedback') {
      if (!isAllowedFeedbackOrigin(req))
        return send(req, res, 403, { error: 'Origem não autorizada.' })
      if (isFeedbackRateLimited(req))
        return send(req, res, 429, { error: 'Muitos envios. Aguarde antes de tentar novamente.' })

      const input = await body(req)
      const submissionId = String(input.submissionId || '').trim()
      const gameId = String(input.gameId || '')
      const clarity = String(input.clarity || '')
      const connection = String(input.connection || '')
      const replayIntent = String(input.replayIntent || '')
      const suggestion = String(input.suggestion || '').trim()

      if (!/^[a-zA-Z0-9_-]{16,80}$/.test(submissionId))
        return send(req, res, 400, { error: 'Identificador de envio inválido.' })
      if (!feedbackGames.has(gameId)) return send(req, res, 400, { error: 'Jogo inválido.' })
      if (![clarity, connection, replayIntent].every((value) => feedbackSignals.has(value)))
        return send(req, res, 400, { error: 'Responda aos três sinais do feedback.' })
      if (suggestion.length > 500)
        return send(req, res, 400, { error: 'A sugestão deve ter no máximo 500 caracteres.' })

      const record = {
        id: randomUUID(),
        submissionId,
        gameId,
        clarity,
        connection,
        replayIntent,
        suggestion,
        createdAt: new Date().toISOString(),
      }

      if (usesPostgresFeedback()) {
        const result = await storePostgresFeedback(record, config.mpvFeedbackRetentionDays)
        return send(req, res, result.duplicate ? 200 : 201, result)
      }

      db.mpvFeedback ??= []
      const existing = db.mpvFeedback.find((item) => item.submissionId === submissionId)
      if (existing) return send(req, res, 200, { id: existing.id, duplicate: true })

      const cutoff = Date.now() - config.mpvFeedbackRetentionDays * 86_400_000
      db.mpvFeedback = db.mpvFeedback.filter((item) => new Date(item.createdAt).getTime() >= cutoff)
      db.mpvFeedback.push(record)
      saveDb(db)
      return send(req, res, 201, { id: record.id, duplicate: false })
    }
    if (req.method === 'GET' && req.url === '/api/mpv/feedback/export') {
      if (config.mpvExportToken.length < 32)
        return send(req, res, 503, { error: 'Exportação não configurada.' })
      if (!validExportToken(req)) return send(req, res, 403, { error: 'Acesso negado.' })
      const records = usesPostgresFeedback() ? await listPostgresFeedback() : db.mpvFeedback || []
      return sendCsv(
        req,
        res,
        `feedback-mpv-${new Date().toISOString().slice(0, 10)}.csv`,
        feedbackCsv(records),
      )
    }
    const user = auth(req, db)
    if (!user) return send(req, res, 401, { error: 'Sessão inválida ou expirada.' })
    if (req.method === 'GET' && req.url === '/api/me')
      return send(req, res, 200, { user: publicUser(user, db) })
    if (req.method === 'GET' && req.url === '/api/admin/metrics') {
      if (!config.adminEmails.includes(user.email))
        return send(req, res, 403, { error: 'Acesso restrito à administração.' })
      return send(req, res, 200, buildMetrics(db))
    }
    if (req.method === 'POST' && req.url === '/api/events') {
      const input = await body(req)
      const name = String(input.name || '')
      if (!clientEventNames.has(name)) return send(req, res, 400, { error: 'Evento inválido.' })
      recordEvent(db, name, user, input.properties)
      saveDb(db)
      return send(req, res, 202, { ok: true })
    }
    if (req.method === 'POST' && req.url === '/api/couples/create') {
      if (user.coupleId) return send(req, res, 409, { error: 'Você já está em um casal.' })
      const input = await body(req)
      let invite = code()
      while (db.couples.some((item) => item.code === invite)) invite = code()
      const couple = {
        id: randomUUID(),
        code: invite,
        anniversary: input.anniversary || '',
        members: [user.id],
        createdAt: new Date().toISOString(),
      }
      user.coupleId = couple.id
      db.couples.push(couple)
      recordEvent(db, 'couple_created', user)
      saveDb(db)
      return send(req, res, 201, { user: publicUser(user, db) })
    }
    if (req.method === 'POST' && req.url === '/api/couples/join') {
      if (user.coupleId) return send(req, res, 409, { error: 'Você já está em um casal.' })
      const input = await body(req)
      const couple = db.couples.find(
        (item) =>
          item.code ===
          String(input.code || '')
            .trim()
            .toUpperCase(),
      )
      if (!couple) return send(req, res, 404, { error: 'Código de convite não encontrado.' })
      if (couple.members.length >= 2)
        return send(req, res, 409, { error: 'Este casal já possui dois participantes.' })
      couple.members.push(user.id)
      user.coupleId = couple.id
      couple.pairedAt = new Date().toISOString()
      recordEvent(db, 'couple_paired', user)
      saveDb(db)
      return send(req, res, 200, { user: publicUser(user, db) })
    }
    if (req.method === 'GET' && req.url?.startsWith('/api/answers/')) {
      if (!user.coupleId) return send(req, res, 400, { error: 'Conecte-se ao seu amor primeiro.' })
      const questionId = decodeURIComponent(req.url.split('/').pop())
      const coupleAnswers = db.answers.filter(
        (item) => item.coupleId === user.coupleId && item.questionId === questionId,
      )
      const complete = coupleAnswers.length >= 2
      return send(req, res, 200, {
        complete,
        mine: coupleAnswers.find((item) => item.userId === user.id)?.text || '',
        answers: complete
          ? coupleAnswers.map((item) => ({
              name: db.users.find((u) => u.id === item.userId)?.name,
              text: item.text,
            }))
          : [],
      })
    }
    if (req.method === 'POST' && req.url?.startsWith('/api/answers/')) {
      if (!user.coupleId) return send(req, res, 400, { error: 'Conecte-se ao seu amor primeiro.' })
      const questionId = decodeURIComponent(req.url.split('/').pop())
      const input = await body(req)
      const text = String(input.text || '').trim()
      if (!text || text.length > 500)
        return send(req, res, 400, { error: 'A resposta deve ter entre 1 e 500 caracteres.' })
      const found = db.answers.find(
        (item) =>
          item.coupleId === user.coupleId &&
          item.questionId === questionId &&
          item.userId === user.id,
      )
      if (found) found.text = text
      else
        db.answers.push({
          id: randomUUID(),
          coupleId: user.coupleId,
          questionId,
          userId: user.id,
          text,
        })
      recordEvent(db, 'answer_submitted', user)
      const completedNow =
        !found &&
        db.answers.filter(
          (item) => item.coupleId === user.coupleId && item.questionId === questionId,
        ).length === 2
      const alreadyCounted = db.analyticsEvents.some(
        (event) =>
          event.name === 'mutual_experience_completed' &&
          event.coupleId === user.coupleId &&
          event.properties?.questionId === questionId,
      )
      if (completedNow && !alreadyCounted)
        recordEvent(db, 'mutual_experience_completed', user, { questionId })
      saveDb(db)
      return send(req, res, 200, { ok: true })
    }
    send(req, res, 404, { error: 'Rota não encontrada.' })
  } catch (error) {
    send(req, res, 500, { error: error instanceof Error ? error.message : 'Erro interno.' })
  }
})

if (config.databaseUrl) {
  try {
    await applyMigrations({ connectionString: config.databaseUrl, logger: console.log })
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : 'unknown'
    console.error(`Falha ao preparar o PostgreSQL (${code}).`)
    process.exit(1)
  }
}

server.listen(config.port, config.host, () => {
  console.log(`Aplicação disponível em http://${config.host}:${config.port}`)
})

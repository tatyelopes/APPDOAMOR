import { randomUUID } from 'node:crypto'
import { performance } from 'node:perf_hooks'

const startedAt = Date.now()
const knownApiRoutes = new Set([
  '/api/health',
  '/api/ready',
  '/api/ops/metrics',
  '/api/register',
  '/api/login',
  '/api/me',
  '/api/admin/metrics',
  '/api/events',
  '/api/couples/create',
  '/api/couples/join',
  '/api/love-notes',
  '/api/mpv/feedback',
  '/api/mpv/feedback/export',
])

const operationalMetrics = {
  requests: {
    total: 0,
    inFlight: 0,
    serverErrors: 0,
    byStatusClass: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
    byRoute: {},
  },
  readiness: {
    checks: 0,
    failures: 0,
    lastStatus: 'unknown',
    lastCheckedAt: null,
    lastLatencyMs: null,
  },
}

function deploymentVersion() {
  return String(process.env.RENDER_GIT_COMMIT || process.env.APP_VERSION || 'local').slice(0, 12)
}

function safeRequestId(value) {
  const candidate = Array.isArray(value) ? value[0] : String(value || '')
  return /^[a-zA-Z0-9._-]{8,80}$/.test(candidate) ? candidate : randomUUID()
}

function routeLabel(rawUrl) {
  try {
    const pathname = new URL(rawUrl || '/', 'http://localhost').pathname
    if (knownApiRoutes.has(pathname)) return pathname
    if (pathname.startsWith('/api/answers/')) return '/api/answers/:questionId'
    if (pathname.startsWith('/api/')) return '/api/unknown'
    if (pathname.startsWith('/assets/')) return '/assets/:file'
    return '/frontend'
  } catch {
    return '/invalid'
  }
}

function safeErrorCode(error) {
  const candidate =
    error && typeof error === 'object' && 'code' in error ? String(error.code) : 'internal_error'
  return /^[a-zA-Z0-9_-]{1,40}$/.test(candidate) ? candidate : 'internal_error'
}

export function logEvent(level, event, fields = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    service: 'momento-a-dois-api',
    environment: String(process.env.NODE_ENV || 'development'),
    version: deploymentVersion(),
    ...fields,
  }
  const output = JSON.stringify(entry)
  if (level === 'error') console.error(output)
  else console.log(output)
}

export function logError(event, error, fields = {}) {
  logEvent('error', event, {
    ...fields,
    errorCode: safeErrorCode(error),
    errorType: error instanceof Error ? error.name : 'UnknownError',
  })
}

export function observeRequest(req, res) {
  const requestId = safeRequestId(req.headers['x-request-id'])
  const route = routeLabel(req.url)
  const started = performance.now()
  operationalMetrics.requests.inFlight += 1
  res.setHeader('X-Request-Id', requestId)

  res.once('finish', () => {
    const status = res.statusCode
    const statusClass = `${Math.floor(status / 100)}xx`
    operationalMetrics.requests.total += 1
    operationalMetrics.requests.inFlight = Math.max(0, operationalMetrics.requests.inFlight - 1)
    operationalMetrics.requests.byStatusClass[statusClass] ??= 0
    operationalMetrics.requests.byStatusClass[statusClass] += 1
    operationalMetrics.requests.byRoute[route] ??= 0
    operationalMetrics.requests.byRoute[route] += 1
    if (status >= 500) operationalMetrics.requests.serverErrors += 1

    if (route === '/assets/:file' || (route === '/api/health' && status < 400)) return
    logEvent(status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info', 'http_request', {
      requestId,
      method: String(req.method || 'UNKNOWN'),
      route,
      status,
      durationMs: Number((performance.now() - started).toFixed(1)),
    })
  })

  return requestId
}

export function recordReadiness(ready, latencyMs) {
  operationalMetrics.readiness.checks += 1
  if (!ready) operationalMetrics.readiness.failures += 1
  operationalMetrics.readiness.lastStatus = ready ? 'ready' : 'not_ready'
  operationalMetrics.readiness.lastCheckedAt = new Date().toISOString()
  operationalMetrics.readiness.lastLatencyMs = Number(latencyMs.toFixed(1))
}

export function operationalMetricsSnapshot() {
  const memory = process.memoryUsage()
  return {
    status: 'ok',
    service: 'momento-a-dois-api',
    environment: String(process.env.NODE_ENV || 'development'),
    version: deploymentVersion(),
    startedAt: new Date(startedAt).toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    requests: structuredClone(operationalMetrics.requests),
    readiness: structuredClone(operationalMetrics.readiness),
    process: {
      rssBytes: memory.rss,
      heapUsedBytes: memory.heapUsed,
      heapTotalBytes: memory.heapTotal,
    },
  }
}

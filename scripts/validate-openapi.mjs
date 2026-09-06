import { readFileSync } from 'node:fs'

const file = new URL('../docs/openapi-v1.json', import.meta.url)
const document = JSON.parse(readFileSync(file, 'utf8'))
const errors = []
const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'])
const statuses = new Set(['partial', 'planned', 'implemented'])

function assert(condition, message) {
  if (!condition) errors.push(message)
}

function resolvePointer(pointer) {
  if (!pointer.startsWith('#/')) return undefined
  return pointer.slice(2).split('/').reduce((value, segment) => {
    const key = segment.replaceAll('~1', '/').replaceAll('~0', '~')
    return value?.[key]
  }, document)
}

function visit(value, location = '#') {
  if (!value || typeof value !== 'object') return
  if (typeof value.$ref === 'string') {
    assert(Boolean(resolvePointer(value.$ref)), `${location}: referência inexistente ${value.$ref}`)
  }
  for (const [key, child] of Object.entries(value)) visit(child, `${location}/${key}`)
}

assert(document.openapi === '3.1.0', 'openapi deve ser 3.1.0')
assert(document.jsonSchemaDialect === 'https://json-schema.org/draft/2020-12/schema', 'dialeto JSON Schema inesperado')
assert(document.info?.version === '0.1.0-draft', 'info.version deve refletir o estado draft')
assert(document.servers?.some(server => server.url === '/api/v1'), 'servidor /api/v1 ausente')
assert(document.components?.securitySchemes?.bearerAuth?.scheme === 'bearer', 'bearerAuth ausente')

const operationIds = new Set()
let operationCount = 0
let partialCount = 0
let plannedCount = 0

for (const [path, pathItem] of Object.entries(document.paths || {})) {
  assert(path.startsWith('/'), `caminho inválido: ${path}`)
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!methods.has(method)) continue
    operationCount += 1
    assert(Boolean(operation.operationId), `${method.toUpperCase()} ${path}: operationId ausente`)
    assert(!operationIds.has(operation.operationId), `${method.toUpperCase()} ${path}: operationId duplicado`)
    operationIds.add(operation.operationId)
    assert(statuses.has(operation['x-implementation-status']), `${method.toUpperCase()} ${path}: status de implementação inválido`)
    assert(Object.keys(operation.responses || {}).length > 0, `${method.toUpperCase()} ${path}: responses ausentes`)
    if (operation['x-implementation-status'] === 'partial') partialCount += 1
    if (operation['x-implementation-status'] === 'planned') plannedCount += 1
  }
}

assert(operationCount >= 20, `cobertura insuficiente: ${operationCount} operações`)
assert(partialCount > 0, 'o contrato deve identificar operações parciais atuais')
assert(plannedCount > 0, 'o contrato deve identificar operações planejadas')
visit(document)

if (errors.length) {
  console.error(`OpenAPI inválido (${errors.length} erro(s)):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`OpenAPI válido: ${Object.keys(document.paths).length} caminhos, ${operationCount} operações únicas, ${partialCount} parciais e ${plannedCount} planejadas; referências locais resolvidas.`)

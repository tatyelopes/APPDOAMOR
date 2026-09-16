import { readFileSync } from 'node:fs'

const document = readFileSync(new URL('../docs/MODELAGEM-DE-AMEACAS.md', import.meta.url), 'utf8')
const errors = []

function rows(pattern) {
  return document
    .split(/\r?\n/)
    .map((line) =>
      line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim()),
    )
    .filter((row) => pattern.test(row[0] || ''))
}

function assert(condition, message) {
  if (!condition) errors.push(message)
}

function uniqueIds(table, name) {
  const ids = table.map((row) => row[0])
  assert(new Set(ids).size === ids.length, `${name}: IDs duplicados`)
  return new Set(ids)
}

const threats = rows(/^T\d{2}$/)
const controls = rows(/^SEC-\d{2}$/)
const tests = rows(/^ST-\d{2}$/)
const threatIds = uniqueIds(threats, 'ameaças')
const controlIds = uniqueIds(controls, 'controles')
uniqueIds(tests, 'testes')

assert(threats.length >= 20, `esperadas ao menos 20 ameaças; encontradas ${threats.length}`)
assert(controls.length >= 25, `esperados ao menos 25 controles; encontrados ${controls.length}`)
assert(tests.length >= 18, `esperados ao menos 18 testes; encontrados ${tests.length}`)
assert(document.includes('```mermaid'), 'diagrama Mermaid ausente')
assert(document.includes('## Gates de segurança para piloto'), 'gates de segurança ausentes')
assert(document.includes('não está apto para piloto externo'), 'decisão de segurança ausente')

for (const row of threats) {
  const [id, , , probability, impact, risk, response, situation] = row
  assert(/^T\d{2}$/.test(id), `ID de ameaça inválido: ${id}`)
  assert(/^[1-5]$/.test(probability), `${id}: probabilidade inválida`)
  assert(/^[1-5]$/.test(impact), `${id}: impacto inválido`)
  assert(/\d+ (baixo|médio|alto|crítico)/.test(risk), `${id}: nível de risco inválido`)
  const score = Number(probability) * Number(impact)
  assert(Number(risk.split(' ')[0]) === score, `${id}: score não corresponde a P × I`)
  const referencedControls = response.match(/SEC-\d{2}/g) || []
  assert(referencedControls.length > 0, `${id}: nenhum controle associado`)
  for (const control of referencedControls)
    assert(controlIds.has(control), `${id}: controle inexistente ${control}`)
  assert(situation === 'Aberta', `${id}: ameaça sem evidência deve permanecer aberta`)
}

for (const row of controls) {
  const [id, requirement, state, plan] = row
  assert(/^SEC-\d{2}$/.test(id), `ID de controle inválido: ${id}`)
  assert(requirement.length >= 30, `${id}: requisito pouco verificável`)
  assert(
    ['Ausente', 'Parcial', 'Aberto', 'Implementado'].includes(state),
    `${id}: estado inválido ${state}`,
  )
  assert(/\d/.test(plan), `${id}: tarefa do plano ausente`)
}

for (const row of tests) {
  const [id, test, expected, plan] = row
  assert(/^ST-\d{2}$/.test(id), `ID de teste inválido: ${id}`)
  assert(test.length >= 20, `${id}: cenário insuficiente`)
  assert(expected.length >= 20, `${id}: resultado insuficiente`)
  assert(/\d/.test(plan), `${id}: cobertura futura ausente`)
}

assert(threatIds.has('T01') && threatIds.has('T22'), 'faixa T01–T22 incompleta')
assert(
  document.includes('22 ameaças: 13 críticas, 8 altas e 1 média'),
  'resumo da distribuição de riscos divergente',
)

if (errors.length) {
  console.error(`Modelagem de ameaças inválida (${errors.length} erro(s)):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

const byLevel = threats.reduce((totals, row) => {
  const level = row[5].split(' ')[1]
  totals[level] = (totals[level] || 0) + 1
  return totals
}, {})

console.log(
  `Modelagem validada: ${threats.length} ameaças, ${controls.length} controles e ${tests.length} testes; ${JSON.stringify(byLevel)}.`,
)

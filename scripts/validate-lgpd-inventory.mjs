import { readFile } from 'node:fs/promises'

const inventoryPath = new URL('../docs/INVENTARIO-DE-DADOS-E-BASES-LEGAIS-LGPD.md', import.meta.url)
const source = await readFile(inventoryPath, 'utf8')

const failures = []
const expect = (condition, message) => {
  if (!condition) failures.push(message)
}

const ids = prefix => [...source.matchAll(new RegExp(`\\| (${prefix}-\\d{2}) \\|`, 'g'))].map(match => match[1])
const unique = values => new Set(values).size === values.length

const dataGroups = ids('DG')
const operations = ids('OP')
const retentionRules = ids('RT')
const consents = ids('CS')
const decisions = ids('DEC')

expect(dataGroups.length >= 17, `Esperados pelo menos 17 grupos de dados; encontrados ${dataGroups.length}.`)
expect(operations.length >= 20, `Esperadas pelo menos 20 operações; encontradas ${operations.length}.`)
expect(retentionRules.length >= 12, `Esperadas pelo menos 12 regras de retenção; encontradas ${retentionRules.length}.`)
expect(consents.length >= 5, `Esperados pelo menos 5 consentimentos; encontrados ${consents.length}.`)
expect(decisions.length >= 11, `Esperadas pelo menos 11 pendências; encontradas ${decisions.length}.`)

for (const [name, values] of Object.entries({ DG: dataGroups, OP: operations, RT: retentionRules, CS: consents, DEC: decisions })) {
  expect(unique(values), `Há IDs ${name} duplicados.`)
}

const operationRows = source.split('\n').filter(line => /^\| OP-\d{2} \|/.test(line))
for (const row of operationRows) {
  const columns = row.split('|').slice(1, -1).map(value => value.trim())
  expect(columns.length === 7, `${columns[0] || 'Operação'} deve ter 7 colunas; tem ${columns.length}.`)
  expect(/Art\. (7º|11)/.test(columns[3] || ''), `${columns[0]} não informa base do art. 7º ou 11.`)
  expect((columns[5] || '').length >= 5, `${columns[0]} não informa retenção.`)
  expect((columns[6] || '').length >= 5, `${columns[0]} não informa status.`)
}

for (const sensitiveOperation of ['OP-08', 'OP-10', 'OP-11', 'OP-12']) {
  const row = operationRows.find(value => value.startsWith(`| ${sensitiveOperation} |`)) || ''
  expect(/Art\. 11/.test(row), `${sensitiveOperation} precisa tratar a hipótese do art. 11.`)
}

const requiredStatements = [
  ['controlador a formalizar', /Controlador[\s\S]{0,300}\*\*A formalizar\*\*/],
  ['encarregado e canal', /Encarregado e canal/],
  ['titulares', /## Papéis e titulares/],
  ['necessidade e proibições', /## Matriz de necessidade e proibições/],
  ['direitos dos titulares', /## Direitos dos titulares/],
  ['operadores e transferências', /## Acesso, operadores e transferências/],
  ['incidentes e RIPD', /## Incidentes e RIPD/],
  ['crianças e adolescentes', /Crianças e adolescentes ficam fora do escopo/],
  ['consentimento específico', /consentimento específico e destacado/],
  ['piloto bloqueado', /não está apto para piloto externo/],
  ['Lei nº 13.709', /Lei nº 13\.709\/2018/],
  ['Resolução de incidentes', /Resolução CD\/ANPD nº 15\/2024/],
  ['Resolução de transferência', /Resolução CD\/ANPD nº 19\/2024/],
]

for (const [label, pattern] of requiredStatements) {
  expect(pattern.test(source), `Seção ou decisão ausente: ${label}.`)
}

if (failures.length) {
  console.error('Inventário LGPD inválido:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Inventário LGPD válido: ${dataGroups.length} grupos de dados, ${operations.length} operações, ${retentionRules.length} regras de retenção, ${consents.length} consentimentos e ${decisions.length} pendências.`)

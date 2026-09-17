import { randomBytes } from 'node:crypto'
import { open, readFile, rm } from 'node:fs/promises'

const localConfigurationPath = new URL('../.env.local', import.meta.url)
const postgresConfigurationPath = new URL('../.env.postgres.local', import.meta.url)
const localExamplePath = new URL('../.env.local.example', import.meta.url)
const postgresExamplePath = new URL('../.env.postgres.local.example', import.meta.url)

const databasePassword = randomBytes(24).toString('base64url')
const exportToken = randomBytes(32).toString('base64url')

const localExample = await readFile(localExamplePath, 'utf8')
const postgresExample = await readFile(postgresExamplePath, 'utf8')
const localConfiguration = localExample
  .replaceAll('substitua-por-uma-senha-local', databasePassword)
  .replace('substitua-por-um-token-aleatorio-com-32-caracteres', exportToken)
const postgresConfiguration = postgresExample.replaceAll(
  'substitua-por-uma-senha-local',
  databasePassword,
)

const createdFiles = []
let currentFile
try {
  currentFile = await open(postgresConfigurationPath, 'wx', 0o600)
  createdFiles.push(postgresConfigurationPath)
  await currentFile.writeFile(postgresConfiguration, 'utf8')
  await currentFile.close()
  currentFile = undefined

  currentFile = await open(localConfigurationPath, 'wx', 0o600)
  createdFiles.push(localConfigurationPath)
  await currentFile.writeFile(localConfiguration, 'utf8')
  await currentFile.close()
  currentFile = undefined

  console.log('Configurações locais criadas sem exibir os segredos. Não envie os arquivos ao Git.')
} catch (error) {
  await currentFile?.close().catch(() => undefined)
  for (const path of createdFiles.reverse()) await rm(path, { force: true })
  if (error.code === 'EEXIST') {
    throw new Error('Configuração local já existe; nenhum arquivo foi sobrescrito.', {
      cause: error,
    })
  }
  throw error
}

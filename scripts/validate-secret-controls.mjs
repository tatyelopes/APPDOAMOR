import assert from 'node:assert/strict'
import { validateSecretConfiguration } from '../server/src/shared/secret-configuration.js'

function rejected(environment, fragment) {
  assert.throws(() => validateSecretConfiguration(environment), new RegExp(fragment, 'i'))
}

validateSecretConfiguration({ NODE_ENV: 'development' })
validateSecretConfiguration({
  NODE_ENV: 'development',
  MPV_EXPORT_TOKEN: 'teste-token-local-com-mais-de-32-caracteres',
})

rejected(
  { NODE_ENV: 'development', MPV_EXPORT_TOKEN: 'teste-curto' },
  'MPV_EXPORT_TOKEN deve ser aleatório',
)
rejected(
  {
    NODE_ENV: 'development',
    DATABASE_URL: 'postgresql://app:substitua-por-uma-senha@127.0.0.1:5432/app_do_amor_local',
  },
  'credenciais não demonstrativas',
)
rejected(
  {
    NODE_ENV: 'development',
    [['VITE', 'PRIVATE', 'TOKEN'].join('_')]: 'teste-valor-publico-proibido',
  },
  'não pode expor segredo ao frontend',
)
rejected({ NODE_ENV: 'production' }, 'DATABASE_URL é obrigatória')
rejected(
  {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://app:teste-senha-segura@database.internal:5432/app',
  },
  'MPV_EXPORT_TOKEN é obrigatório',
)

validateSecretConfiguration({
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://app:teste-senha-segura@database.internal:5432/app',
  MPV_EXPORT_TOKEN: 'teste-token-remoto-com-mais-de-32-caracteres',
})

console.log(
  JSON.stringify(
    {
      status: 'aprovado',
      checks: {
        localWithoutRemoteSecrets: true,
        strongExportToken: true,
        placeholderDatabasePasswordRejected: true,
        frontendSecretRejected: true,
        remoteDatabaseRequired: true,
        remoteExportTokenRequired: true,
      },
    },
    null,
    2,
  ),
)

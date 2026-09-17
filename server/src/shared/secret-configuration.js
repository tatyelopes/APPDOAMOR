const secretNamePattern = /(SECRET|TOKEN|PASSWORD|PRIVATE_KEY|DATABASE_URL)/i
const placeholderPattern = /(substitua|replace|changeme|example|exemplo|placeholder|<[^>]+>)/i

function isPlaceholder(value) {
  return placeholderPattern.test(String(value || ''))
}

export function validateSecretConfiguration(environment = process.env) {
  const issues = []
  const nodeEnvironment = String(environment.NODE_ENV || 'development').toLowerCase()
  const isRemote = nodeEnvironment === 'production'
  const databaseUrl = String(environment.DATABASE_URL || '').trim()
  const exportToken = String(environment.MPV_EXPORT_TOKEN || '')

  for (const name of Object.keys(environment)) {
    if (name.startsWith('VITE_') && secretNamePattern.test(name)) {
      issues.push(`${name} não pode expor segredo ao frontend.`)
    }
  }

  if (databaseUrl) {
    try {
      const parsed = new URL(databaseUrl)
      if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
        issues.push('DATABASE_URL deve usar PostgreSQL.')
      }
      if (!parsed.username || !parsed.password || isPlaceholder(parsed.password)) {
        issues.push('DATABASE_URL precisa de credenciais não demonstrativas.')
      }
    } catch {
      issues.push('DATABASE_URL é inválida.')
    }
  }

  if (exportToken && (exportToken.length < 32 || isPlaceholder(exportToken))) {
    issues.push('MPV_EXPORT_TOKEN deve ser aleatório e ter pelo menos 32 caracteres.')
  }

  if (isRemote && !databaseUrl) issues.push('DATABASE_URL é obrigatória em ambiente remoto.')
  if (isRemote && !exportToken) issues.push('MPV_EXPORT_TOKEN é obrigatório em ambiente remoto.')

  if (issues.length > 0) {
    throw new Error(`Configuração segura recusada: ${issues.join(' ')}`)
  }
}

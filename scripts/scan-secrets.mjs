import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const stagedOnly = process.argv.includes('--staged')
const historyOnly = process.argv.includes('--history')
const maximumFileSize = 2_000_000
const safeValuePattern =
  /^(?:|substitua[^\s]*|replace[^\s]*|changeme|example|exemplo|placeholder|teste[^\s]*|test[^\s]*|ci-only-password|exportToken|databaseUrl|\$\{[^}]+\}|<[^\s]*)$/i

const signatureRules = [
  { id: 'private-key', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  {
    id: 'github-token',
    pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b/,
  },
  { id: 'aws-access-key', pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { id: 'google-api-key', pattern: /\bAIza[A-Za-z0-9_-]{35}\b/ },
  { id: 'slack-token', pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/ },
]

function gitFiles() {
  const args = stagedOnly
    ? ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']
    : ['ls-files', '-z']
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 10_000_000 })
    .split('\0')
    .filter(Boolean)
}

async function fileBuffer(path) {
  if (stagedOnly) {
    return execFileSync('git', ['show', `:${path}`], { encoding: null, maxBuffer: 10_000_000 })
  }
  return readFile(path)
}

function normalizedLiteral(rawValue) {
  return rawValue
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/[;,]$/, '')
}

function inspectLine(line) {
  const matches = []
  for (const rule of signatureRules) {
    if (rule.pattern.test(line)) matches.push(rule.id)
  }

  const databaseUrls = line.matchAll(/postgres(?:ql)?:\/\/[^:\s/'"]+:([^@\s/'"]+)@/gi)
  for (const match of databaseUrls) {
    if (!safeValuePattern.test(normalizedLiteral(match[1]))) matches.push('database-credential')
  }

  const assignments = line.matchAll(
    /\b(MPV_EXPORT_TOKEN|POSTGRES_PASSWORD|DATABASE_URL)\b\s*[:=]\s*([^\s#]+)/gi,
  )
  for (const match of assignments) {
    const value = normalizedLiteral(match[2])
    if (match[1].toUpperCase() === 'DATABASE_URL') continue
    if (!safeValuePattern.test(value) && !/^generateValue$/i.test(value)) {
      matches.push('literal-secret-assignment')
    }
  }

  if (/\bVITE_[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY|DATABASE_URL)\b\s*[:=]/i.test(line)) {
    matches.push('frontend-secret')
  }
  return [...new Set(matches)]
}

const findings = []
let scannedDescription
if (historyOnly) {
  const history = execFileSync(
    'git',
    ['log', '--all', '--reverse', '-p', '--no-ext-diff', '--no-color', '--format=commit %H'],
    { encoding: 'utf8', maxBuffer: 100_000_000 },
  )
  let commit = 'desconhecido'
  let path = 'desconhecido'
  for (const line of history.split(/\r?\n/)) {
    if (line.startsWith('commit ')) commit = line.slice(7, 19)
    else if (line.startsWith('+++ b/')) path = line.slice(6)
    else if (line.startsWith('+') && !line.startsWith('+++')) {
      for (const rule of inspectLine(line.slice(1))) findings.push({ path, commit, rule })
    }
  }
  scannedDescription = 'histórico Git'
} else {
  const paths = gitFiles()
  for (const path of paths) {
    let buffer
    try {
      buffer = await fileBuffer(path)
    } catch (error) {
      if (error.code === 'ENOENT') continue
      throw error
    }
    if (buffer.length > maximumFileSize || buffer.includes(0)) continue

    const lines = buffer.toString('utf8').split(/\r?\n/)
    lines.forEach((line, index) => {
      for (const rule of inspectLine(line)) findings.push({ path, line: index + 1, rule })
    })
  }
  scannedDescription = `${paths.length} arquivos ${stagedOnly ? 'staged' : 'rastreados'}`
}

if (findings.length > 0) {
  console.error('Possíveis segredos encontrados; os valores foram ocultados:')
  for (const finding of findings) {
    const location = finding.commit
      ? `${finding.commit}:${finding.path}`
      : `${finding.path}:${finding.line}`
    console.error(`- ${location} (${finding.rule})`)
  }
  process.exitCode = 1
} else {
  console.log(`Varredura de segredos aprovada: ${scannedDescription}.`)
}

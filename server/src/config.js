import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const serverRoot = dirname(dirname(fileURLToPath(import.meta.url)))

export const config = {
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 8787),
  dataFile: process.env.DATABASE_FILE || join(serverRoot, 'data', 'database.json'),
  sessionTtlMs: 30 * 86_400_000,
  adminEmails: String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean),
}

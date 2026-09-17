import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateSecretConfiguration } from './shared/secret-configuration.js'

validateSecretConfiguration()

const serverRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const configuredFeedbackRetentionDays = Number(process.env.MPV_FEEDBACK_RETENTION_DAYS || 90)

export const config = {
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 8787),
  dataFile: process.env.DATABASE_FILE || join(serverRoot, 'data', 'database.json'),
  databaseUrl: String(process.env.DATABASE_URL || ''),
  staticDir: process.env.STATIC_DIR || join(dirname(serverRoot), 'dist'),
  sessionTtlMs: 30 * 86_400_000,
  adminEmails: String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
  appOrigins: String(process.env.APP_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  mpvExportToken: String(process.env.MPV_EXPORT_TOKEN || ''),
  mpvFeedbackRetentionDays:
    Number.isFinite(configuredFeedbackRetentionDays) && configuredFeedbackRetentionDays > 0
      ? configuredFeedbackRetentionDays
      : 90,
}

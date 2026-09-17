import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const migrationsDirectory = fileURLToPath(new URL('../../migrations/', import.meta.url))
const migrationFilePattern = /^(\d{4})_([a-z0-9_]+)\.sql$/
const advisoryLockId = 1_327_041

async function discoverMigrations() {
  const files = (await readdir(migrationsDirectory))
    .filter((file) => migrationFilePattern.test(file))
    .sort()

  const versions = new Set()
  const migrations = []
  for (const file of files) {
    const [, versionText, name] = file.match(migrationFilePattern)
    const version = Number(versionText)
    if (versions.has(version)) throw new Error(`Versão de migração duplicada: ${versionText}.`)
    versions.add(version)
    const sql = await readFile(new URL(`../../migrations/${file}`, import.meta.url), 'utf8')
    if (!sql.trim()) throw new Error(`Migração vazia: ${file}.`)
    migrations.push({
      version,
      name,
      file,
      sql,
      checksum: createHash('sha256').update(sql).digest('hex'),
    })
  }

  if (migrations.length === 0) throw new Error('Nenhuma migração de banco foi encontrada.')
  return migrations
}

export async function applyMigrations({ connectionString, pool: providedPool, logger } = {}) {
  const databaseUrl = String(connectionString || process.env.DATABASE_URL || '').trim()
  if (!providedPool && !databaseUrl) {
    throw new Error('DATABASE_URL é obrigatória para executar as migrações.')
  }

  const migrations = await discoverMigrations()
  const pool =
    providedPool ||
    new pg.Pool({
      connectionString: databaseUrl,
      max: 1,
      connectionTimeoutMillis: 10_000,
    })
  const ownsPool = !providedPool
  let client
  const appliedNow = []

  try {
    client = await pool.connect()
    await client.query('SELECT pg_advisory_lock($1)', [advisoryLockId])
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version integer PRIMARY KEY,
        name text NOT NULL,
        checksum char(64) NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `)

    const appliedResult = await client.query(
      'SELECT version, name, checksum FROM schema_migrations ORDER BY version',
    )
    const applied = new Map(appliedResult.rows.map((row) => [Number(row.version), row]))

    for (const migration of migrations) {
      const existing = applied.get(migration.version)
      if (existing) {
        if (existing.name !== migration.name || existing.checksum.trim() !== migration.checksum) {
          throw new Error(
            `A migração ${migration.file} foi alterada depois de aplicada. Crie uma nova migração.`,
          )
        }
        continue
      }

      await client.query('BEGIN')
      try {
        await client.query(migration.sql)
        await client.query(
          'INSERT INTO schema_migrations (version, name, checksum) VALUES ($1, $2, $3)',
          [migration.version, migration.name, migration.checksum],
        )
        await client.query('COMMIT')
        appliedNow.push(migration.file)
        logger?.(`Migração aplicada: ${migration.file}`)
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      }
    }

    return {
      discovered: migrations.map((migration) => migration.file),
      applied: appliedNow,
      alreadyApplied: migrations.length - appliedNow.length,
    }
  } finally {
    await client?.query('SELECT pg_advisory_unlock($1)', [advisoryLockId]).catch(() => undefined)
    client?.release()
    if (ownsPool) await pool.end()
  }
}

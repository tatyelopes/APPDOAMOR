import pg from 'pg'
import { applyMigrations } from '../server/src/infra/migrations.js'

const databaseUrl = String(process.env.DATABASE_URL || '').trim()
if (!databaseUrl) throw new Error('DATABASE_URL é obrigatória para validar o PostgreSQL.')

const expectedTables = [
  'analytics_events',
  'answers',
  'auth_sessions',
  'couple_members',
  'couple_progress',
  'couples',
  'game_sessions',
  'mpv_feedback',
  'progress_events',
  'schema_migrations',
  'session_participants',
  'session_rounds',
  'users',
]

function expect(condition, message) {
  if (!condition) throw new Error(message)
}

let savepoint = 0
async function expectDatabaseRejection(client, query, expectedCode, message) {
  savepoint += 1
  const name = `expected_rejection_${savepoint}`
  await client.query(`SAVEPOINT ${name}`)
  try {
    await client.query(query)
    throw new Error(message)
  } catch (error) {
    if (error.code !== expectedCode) throw error
  } finally {
    await client.query(`ROLLBACK TO SAVEPOINT ${name}`)
    await client.query(`RELEASE SAVEPOINT ${name}`)
  }
}

const pool = new pg.Pool({ connectionString: databaseUrl, max: 2 })
let client
try {
  const firstPass = await applyMigrations({ pool })
  const secondPass = await applyMigrations({ pool })
  expect(firstPass.discovered.length === 2, 'Deveriam existir duas migrações versionadas.')
  expect(secondPass.applied.length === 0, 'Reexecutar as migrações deveria ser idempotente.')

  const tables = await pool.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `)
  expect(
    JSON.stringify(tables.rows.map((row) => row.tablename)) === JSON.stringify(expectedTables),
    `Tabelas inesperadas: ${tables.rows.map((row) => row.tablename).join(', ')}.`,
  )

  const migrationRows = await pool.query(
    'SELECT version, name, length(trim(checksum)) AS checksum_length FROM schema_migrations ORDER BY version',
  )
  expect(
    JSON.stringify(migrationRows.rows) ===
      JSON.stringify([
        { version: 1, name: 'core_schema', checksum_length: 64 },
        { version: 2, name: 'mpv_feedback', checksum_length: 64 },
      ]),
    'O histórico de migrações não corresponde aos arquivos versionados.',
  )

  client = await pool.connect()
  await client.query('BEGIN')
  await client.query(`
    INSERT INTO users (id, name, email, password_hash)
    VALUES
      ('00000000-0000-4000-8000-000000000001', 'Pessoa Um', 'pessoa1@example.test', 'hash-1'),
      ('00000000-0000-4000-8000-000000000002', 'Pessoa Dois', 'pessoa2@example.test', 'hash-2')
  `)
  await expectDatabaseRejection(
    client,
    `INSERT INTO users (id, name, email, password_hash)
     VALUES ('00000000-0000-4000-8000-000000000003', 'Duplicada', 'pessoa1@example.test', 'hash-3')`,
    '23505',
    'E-mails duplicados deveriam ser rejeitados.',
  )

  await client.query(`
    INSERT INTO couples
      (id, status, timezone, invite_token_hash, invite_expires_at)
    VALUES
      ('10000000-0000-4000-8000-000000000001', 'waiting', 'America/Sao_Paulo', 'invite-hash', now() + interval '1 day')
  `)
  await client.query(`
    INSERT INTO couple_members (id, couple_id, user_id, slot)
    VALUES (
      '20000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000001',
      1
    )
  `)
  await expectDatabaseRejection(
    client,
    `INSERT INTO couple_members (id, couple_id, user_id, slot)
     VALUES (
       '20000000-0000-4000-8000-000000000002',
       '10000000-0000-4000-8000-000000000001',
       '00000000-0000-4000-8000-000000000002',
       1
     )`,
    '23505',
    'A mesma vaga vigente do casal deveria ser única.',
  )
  await expectDatabaseRejection(
    client,
    `INSERT INTO couple_members (id, couple_id, user_id, slot)
     VALUES (
       '20000000-0000-4000-8000-000000000003',
       '10000000-0000-4000-8000-000000000001',
       '00000000-0000-4000-8000-000000000002',
       3
     )`,
    '23514',
    'Vagas fora de 1 e 2 deveriam ser rejeitadas.',
  )

  await client.query(`
    INSERT INTO mpv_feedback
      (id, submission_id, game_id, clarity, connection, replay_intent, suggestion)
    VALUES (
      '30000000-0000-4000-8000-000000000001',
      'database-validation-0001',
      'love-style-sample',
      'yes',
      'yes',
      'yes',
      'Registro descartável da validação.'
    )
  `)
  await expectDatabaseRejection(
    client,
    `INSERT INTO mpv_feedback
       (id, submission_id, game_id, clarity, connection, replay_intent)
     VALUES (
       '30000000-0000-4000-8000-000000000002',
       'database-validation-0001',
       'discovery-together',
       'yes',
       'yes',
       'no'
     )`,
    '23505',
    'O identificador idempotente do feedback deveria ser único.',
  )
  await client.query('ROLLBACK')

  console.log(
    JSON.stringify(
      {
        status: 'aprovado',
        postgresVersion: (await pool.query('SHOW server_version')).rows[0].server_version,
        migrations: migrationRows.rows.length,
        tables: expectedTables.length,
        checks: {
          migrationHistory: true,
          idempotentRunner: true,
          completeTargetSchema: true,
          normalizedEmailUniqueness: true,
          activeCoupleSlotUniqueness: true,
          coupleSlotDomain: true,
          feedbackSubmissionIdempotency: true,
          validationDataRolledBack: true,
        },
      },
      null,
      2,
    ),
  )
} catch (error) {
  if (client) await client.query('ROLLBACK').catch(() => undefined)
  throw error
} finally {
  client?.release()
  await pool.end()
}

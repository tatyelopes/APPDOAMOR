import pg from 'pg'
import { config } from '../config.js'

const pool = config.databaseUrl
  ? new pg.Pool({
      connectionString: config.databaseUrl,
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    })
  : null

let schemaReady

export function usesPostgresFeedback() {
  return Boolean(pool)
}

async function ensureSchema() {
  if (!pool) throw new Error('PostgreSQL não configurado.')
  schemaReady ??= pool
    .query(
      `
      CREATE TABLE IF NOT EXISTS mpv_feedback (
        id uuid PRIMARY KEY,
        submission_id varchar(80) UNIQUE NOT NULL,
        game_id varchar(40) NOT NULL,
        clarity varchar(3) NOT NULL,
        connection varchar(3) NOT NULL,
        replay_intent varchar(3) NOT NULL,
        suggestion varchar(500) NOT NULL DEFAULT '',
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT mpv_feedback_game CHECK (game_id IN ('discovery-together', 'guess-about-me')),
        CONSTRAINT mpv_feedback_clarity CHECK (clarity IN ('yes', 'no')),
        CONSTRAINT mpv_feedback_connection CHECK (connection IN ('yes', 'no')),
        CONSTRAINT mpv_feedback_replay CHECK (replay_intent IN ('yes', 'no'))
      )
    `,
    )
    .catch((error) => {
      schemaReady = undefined
      throw error
    })
  await schemaReady
}

export async function storePostgresFeedback(record, retentionDays) {
  await ensureSchema()
  await pool.query(`DELETE FROM mpv_feedback WHERE created_at < now() - ($1 * interval '1 day')`, [
    retentionDays,
  ])
  const inserted = await pool.query(
    `INSERT INTO mpv_feedback
      (id, submission_id, game_id, clarity, connection, replay_intent, suggestion, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (submission_id) DO NOTHING
     RETURNING id`,
    [
      record.id,
      record.submissionId,
      record.gameId,
      record.clarity,
      record.connection,
      record.replayIntent,
      record.suggestion,
      record.createdAt,
    ],
  )
  if (inserted.rowCount === 1) return { id: inserted.rows[0].id, duplicate: false }

  const existing = await pool.query(`SELECT id FROM mpv_feedback WHERE submission_id = $1`, [
    record.submissionId,
  ])
  return { id: existing.rows[0].id, duplicate: true }
}

export async function listPostgresFeedback() {
  await ensureSchema()
  const result = await pool.query(`
    SELECT
      id,
      created_at AS "createdAt",
      game_id AS "gameId",
      clarity,
      connection,
      replay_intent AS "replayIntent",
      suggestion
    FROM mpv_feedback
    ORDER BY created_at ASC
  `)
  return result.rows.map((record) => ({
    ...record,
    createdAt:
      record.createdAt instanceof Date ? record.createdAt.toISOString() : String(record.createdAt),
  }))
}

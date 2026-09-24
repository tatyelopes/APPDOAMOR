import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { config } from '../config.js'

const emptyDatabase = {
  users: [],
  couples: [],
  sessions: [],
  answers: [],
  loveNotes: [],
  gameSessions: [],
  sessionParticipants: [],
  sessionRounds: [],
  gameAnswers: [],
  analyticsEvents: [],
  mpvFeedback: [],
}

export function loadDatabase() {
  if (!existsSync(config.dataFile)) return structuredClone(emptyDatabase)

  try {
    return {
      ...structuredClone(emptyDatabase),
      ...JSON.parse(readFileSync(config.dataFile, 'utf8')),
    }
  } catch {
    return structuredClone(emptyDatabase)
  }
}

export function saveDatabase(database) {
  mkdirSync(dirname(config.dataFile), { recursive: true })
  writeFileSync(config.dataFile, JSON.stringify(database, null, 2))
}

export function checkJsonDatabaseReadiness() {
  if (!existsSync(config.dataFile)) return
  const parsed = JSON.parse(readFileSync(config.dataFile, 'utf8'))
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('O armazenamento JSON não contém um objeto válido.')
  }
}

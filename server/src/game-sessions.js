import { createHash, randomInt, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'

const modes = new Set(['questions', 'challenges', 'mixed'])
const depthValues = new Set(['light', 'medium', 'deep', 'intimate_opt_in'])
const catalog = JSON.parse(
  readFileSync(new URL('../../src/features/game/activities.json', import.meta.url), 'utf8'),
)

export class GameSessionError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'GameSessionError'
    this.status = status
  }
}

function slug(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeRequest(input) {
  const mode = String(input?.mode || '')
  const roundCount = Number(input?.roundCount)
  const themes = input?.themes ?? []
  const depths = input?.depths ?? []
  if (!modes.has(mode)) throw new GameSessionError(422, 'Escolha um formato de jogo válido.')
  if (!Number.isInteger(roundCount) || roundCount < 1 || roundCount > 20)
    throw new GameSessionError(422, 'A partida deve ter entre 1 e 20 rodadas.')
  if (!Array.isArray(themes) || themes.length > 20 || new Set(themes).size !== themes.length)
    throw new GameSessionError(422, 'A seleção de temas é inválida.')
  if (themes.some((theme) => typeof theme !== 'string' || !theme.trim() || theme.length > 50))
    throw new GameSessionError(422, 'Informe temas únicos e válidos.')
  if (
    !Array.isArray(depths) ||
    depths.length > 3 ||
    new Set(depths).size !== depths.length ||
    depths.some((depth) => !depthValues.has(depth))
  )
    throw new GameSessionError(422, 'A seleção de profundidade é inválida.')
  if (depths.length)
    throw new GameSessionError(
      422,
      'O filtro de profundidade será liberado após a classificação do catálogo editorial.',
    )
  return { mode, roundCount, themes: themes.map((theme) => theme.trim()), depths: [] }
}

function candidatesFor(input) {
  const requested = input.themes.length ? new Set(input.themes) : null
  const entries = catalog.filter((entry) => !requested || requested.has(entry.theme))
  if (requested && entries.length !== requested.size)
    throw new GameSessionError(422, 'Um ou mais temas não existem no catálogo atual.')
  const mapCards = (entry, kind, items) =>
    items.map((prompt, index) => ({
      activityKey: `${slug(entry.theme)}-${kind}-${index + 1}`,
      themeKey: slug(entry.theme),
      kind: kind === 'question' ? 'open_text' : 'challenge',
      prompt,
    }))
  const questions = entries.flatMap((entry) => mapCards(entry, 'question', entry.questions))
  const challenges = entries.flatMap((entry) => mapCards(entry, 'challenge', entry.challenges))
  return input.mode === 'questions'
    ? questions
    : input.mode === 'challenges'
      ? challenges
      : [...questions, ...challenges]
}

function shuffle(items) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const selected = randomInt(index + 1)
    ;[result[index], result[selected]] = [result[selected], result[index]]
  }
  return result
}

function readyCouple(database, user) {
  const couple = database.couples.find(
    (item) => item.id === user.coupleId && item.members?.includes(user.id),
  )
  if (!couple) throw new GameSessionError(409, 'Conecte sua conta a um casal antes de jogar.')
  if (couple.members.length !== 2)
    throw new GameSessionError(
      409,
      'A partida bilateral começa quando as duas contas participarem.',
    )
  return couple
}

export function gameSessionView(database, session, user) {
  const participantIds = database.sessionParticipants
    .filter((participant) => participant.sessionId === session.id)
    .map((participant) => participant.userId)
  if (!participantIds.includes(user.id) || session.coupleId !== user.coupleId)
    throw new GameSessionError(403, 'Esta partida pertence a outro casal.')

  const rounds = database.sessionRounds
    .filter((round) => round.sessionId === session.id)
    .sort((left, right) => left.position - right.position)
    .map((round) => {
      const answers = database.gameAnswers.filter((answer) => answer.roundId === round.id)
      const myAnswer = answers.find((answer) => answer.userId === user.id) || null
      const partnerAnswer = answers.find((answer) => answer.userId !== user.id)
      const revelation =
        round.status === 'resolved'
          ? {
              answers: answers.map((answer) => ({
                participantId: answer.userId,
                kind: answer.kind,
                textValue: answer.textValue ?? null,
                optionKey: answer.optionKey ?? null,
                challengeCompleted: answer.challengeCompleted ?? null,
              })),
            }
          : null
      return {
        id: round.id,
        position: round.position,
        activityKey: round.activityKey,
        contentVersion: round.contentVersion,
        kind: round.kind,
        prompt: round.promptSnapshot,
        options: round.optionsSnapshot || [],
        status: round.status,
        partnerState: partnerAnswer ? 'submitted' : 'not_submitted',
        myAnswer,
        revelation,
      }
    })

  return {
    id: session.id,
    mode: session.mode,
    status: session.status,
    timezone: session.timezone,
    createdAt: session.createdAt,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    rounds,
  }
}

export function createGameSession(database, user, input, idempotencyKey) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      idempotencyKey,
    )
  )
    throw new GameSessionError(422, 'Envie uma Idempotency-Key em formato UUID.')

  const couple = readyCouple(database, user)
  const request = normalizeRequest(input)
  const fingerprint = createHash('sha256').update(JSON.stringify(request)).digest('hex')
  const existing = database.gameSessions.find(
    (session) => session.createdByUserId === user.id && session.idempotencyKey === idempotencyKey,
  )
  if (existing) {
    if (existing.requestFingerprint !== fingerprint)
      throw new GameSessionError(409, 'A chave de idempotência já foi usada com outro pedido.')
    return { session: gameSessionView(database, existing, user), duplicate: true }
  }

  const candidates = candidatesFor(request)
  if (candidates.length < request.roundCount)
    throw new GameSessionError(422, 'Não há atividades suficientes para essa configuração.')

  const now = new Date().toISOString()
  const session = {
    id: randomUUID(),
    coupleId: couple.id,
    mode: request.mode,
    status: 'active',
    timezone: 'America/Sao_Paulo',
    createdAt: now,
    startedAt: now,
    endedAt: null,
    createdByUserId: user.id,
    idempotencyKey,
    requestFingerprint: fingerprint,
  }
  const rounds = shuffle(candidates)
    .slice(0, request.roundCount)
    .map((candidate, index) => ({
      id: randomUUID(),
      sessionId: session.id,
      position: index + 1,
      activityKey: candidate.activityKey,
      contentVersion: 1,
      themeKey: candidate.themeKey,
      kind: candidate.kind,
      promptSnapshot: candidate.prompt,
      optionsSnapshot: [],
      status: 'pending',
      revealedAt: null,
      resolvedAt: null,
    }))

  database.gameSessions.push(session)
  database.sessionParticipants.push(
    ...couple.members.map((userId) => ({
      sessionId: session.id,
      coupleId: couple.id,
      userId,
      joinedAt: now,
    })),
  )
  database.sessionRounds.push(...rounds)
  return { session: gameSessionView(database, session, user), duplicate: false }
}

export function findGameSession(database, user, sessionId) {
  const session = database.gameSessions.find((item) => item.id === sessionId)
  if (!session) throw new GameSessionError(404, 'Partida não encontrada.')
  return gameSessionView(database, session, user)
}

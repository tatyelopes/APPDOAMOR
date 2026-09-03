import { randomUUID } from 'node:crypto'

export const clientEventNames = new Set([
  'home_viewed',
  'question_session_started',
  'question_session_completed',
  'love_language_test_started',
  'love_language_test_completed',
  'temperament_test_started',
  'temperament_test_completed',
  'mutual_reveal_viewed',
  'daily_gesture_completed',
  'trial_started',
  'subscription_started',
  'subscription_cancelled',
  'notification_muted',
  'safety_help_opened',
])

const meaningfulEvents = new Set([
  'answer_submitted',
  'mutual_experience_completed',
  'question_session_completed',
  'love_language_test_completed',
  'temperament_test_completed',
  'mutual_reveal_viewed',
  'daily_gesture_completed',
])

export function recordEvent(db, name, user, properties = {}) {
  db.analyticsEvents ??= []
  db.analyticsEvents.push({
    id: randomUUID(),
    name,
    userId: user?.id || null,
    coupleId: user?.coupleId || null,
    occurredAt: new Date().toISOString(),
    properties: sanitizeProperties(properties),
  })
}

function sanitizeProperties(properties) {
  const allowed = ['source', 'plan', 'screen', 'level', 'questionId']
  return Object.fromEntries(
    allowed
      .filter(key => typeof properties?.[key] === 'string')
      .map(key => [key, String(properties[key]).slice(0, 50)]),
  )
}

function percent(value, total) {
  return total ? Math.round((value / total) * 1000) / 10 : 0
}

function uniqueCouples(events) {
  return new Set(events.map(event => event.coupleId).filter(Boolean))
}

function eventDate(event) {
  return new Date(event.occurredAt).getTime()
}

export function buildMetrics(db, now = Date.now()) {
  const day = 86_400_000
  const events = db.analyticsEvents || []
  const since = days => events.filter(event => eventDate(event) >= now - days * day)
  const pairedCouples = db.couples.filter(couple => couple.members.length === 2)
  const pairedIds = new Set(pairedCouples.map(couple => couple.id))
  const mutualAll = uniqueCouples(events.filter(event => event.name === 'mutual_experience_completed'))
  const mutual7 = uniqueCouples(since(7).filter(event => event.name === 'mutual_experience_completed'))
  const active7 = uniqueCouples(since(7).filter(event => meaningfulEvents.has(event.name)))
  const active30 = uniqueCouples(since(30).filter(event => meaningfulEvents.has(event.name)))

  function retention(days) {
    const eligible = pairedCouples.filter(couple => {
      const created = new Date(couple.createdAt || 0).getTime()
      return created > 0 && created <= now - days * day
    })
    const retained = eligible.filter(couple => {
      const created = new Date(couple.createdAt).getTime()
      return events.some(event => event.coupleId === couple.id && meaningfulEvents.has(event.name) && eventDate(event) >= created + days * day)
    })
    return { eligible: eligible.length, retained: retained.length, rate: percent(retained.length, eligible.length) }
  }

  const weeks = Array.from({ length: 8 }, (_, reverseIndex) => {
    const index = 7 - reverseIndex
    const end = now - index * 7 * day
    const start = end - 7 * day
    const weekEvents = events.filter(event => eventDate(event) >= start && eventDate(event) < end)
    return {
      start: new Date(start).toISOString().slice(0, 10),
      activeCouples: uniqueCouples(weekEvents.filter(event => meaningfulEvents.has(event.name))).size,
      mutualExperiences: weekEvents.filter(event => event.name === 'mutual_experience_completed').length,
    }
  })

  const subscribed = uniqueCouples(events.filter(event => event.name === 'subscription_started'))
  const cancelled = uniqueCouples(events.filter(event => event.name === 'subscription_cancelled'))
  const trials = uniqueCouples(events.filter(event => event.name === 'trial_started'))

  return {
    generatedAt: new Date(now).toISOString(),
    northStar: {
      name: 'Casais com experiência mútua significativa na semana',
      value: mutual7.size,
      eligibleCouples: pairedCouples.length,
      rate: percent(mutual7.size, pairedCouples.length),
    },
    acquisition: {
      registeredUsers7d: since(7).filter(event => event.name === 'user_registered').length,
      registeredUsers30d: since(30).filter(event => event.name === 'user_registered').length,
      coupleSpacesCreated: db.couples.length,
    },
    activation: {
      pairedCouples: pairedCouples.length,
      inviteToPairRate: percent(pairedCouples.length, db.couples.length),
      couplesWithFirstMutualExperience: [...mutualAll].filter(id => pairedIds.has(id)).length,
      pairedToFirstExperienceRate: percent([...mutualAll].filter(id => pairedIds.has(id)).length, pairedCouples.length),
    },
    engagement: {
      weeklyActiveCouples: active7.size,
      monthlyActiveCouples: active30.size,
      mutualExperiences7d: since(7).filter(event => event.name === 'mutual_experience_completed').length,
      reciprocityRate7d: percent(mutual7.size, uniqueCouples(since(7).filter(event => event.name === 'answer_submitted')).size),
    },
    retention: { day7: retention(7), day30: retention(30), day90: retention(90) },
    monetization: {
      trialsStarted: trials.size,
      payingCouples: [...subscribed].filter(id => !cancelled.has(id)).length,
      trialToPaidRate: percent(subscribed.size, trials.size),
      cancellations: cancelled.size,
    },
    safety: {
      privacyIncidents: 0,
      notificationsMuted: events.filter(event => event.name === 'notification_muted').length,
      safetyHelpOpened: events.filter(event => event.name === 'safety_help_opened').length,
      unlinkedCouples: events.filter(event => event.name === 'couple_unlinked').length,
    },
    trend: weeks,
  }
}

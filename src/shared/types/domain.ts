export type Screen =
  | 'home'
  | 'questions'
  | 'test'
  | 'result'
  | 'temperament'
  | 'temperamentResult'
  | 'profile'
  | 'private'
  | 'admin'

export type Member = 'owner' | 'partner'

export type Profile = {
  name: string
  email: string
  partner: string
  anniversary: string
  inviteCode: string
}

export type Language =
  'Tempo de qualidade' | 'Palavras de afirmação' | 'Atos de serviço' | 'Toque físico' | 'Presentes'

export type ApiUser = {
  id: string
  name: string
  email: string
  isAdmin?: boolean
  couple: null | {
    id: string
    code: string
    anniversary: string
    partner: null | { id: string; name: string }
  }
}

export type AdminMetrics = {
  generatedAt: string
  northStar: { name: string; value: number; eligibleCouples: number; rate: number }
  acquisition: {
    registeredUsers7d: number
    registeredUsers30d: number
    coupleSpacesCreated: number
  }
  activation: {
    pairedCouples: number
    inviteToPairRate: number
    couplesWithFirstMutualExperience: number
    pairedToFirstExperienceRate: number
  }
  engagement: {
    weeklyActiveCouples: number
    monthlyActiveCouples: number
    mutualExperiences7d: number
    reciprocityRate7d: number
  }
  retention: Record<
    'day7' | 'day30' | 'day90',
    { eligible: number; retained: number; rate: number }
  >
  monetization: {
    trialsStarted: number
    payingCouples: number
    trialToPaidRate: number
    cancellations: number
  }
  safety: {
    privacyIncidents: number
    notificationsMuted: number
    safetyHelpOpened: number
    unlinkedCouples: number
  }
  trend: { start: string; activeCouples: number; mutualExperiences: number }[]
}

export type RemoteAnswer = {
  complete: boolean
  mine: string
  answers: { name: string; text: string }[]
}

export type Temperament = 'Colérico' | 'Sanguíneo' | 'Fleumático' | 'Melancólico'

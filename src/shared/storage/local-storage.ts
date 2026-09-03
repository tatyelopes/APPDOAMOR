export const storageKeys = {
  onboardingCompleted: 'conectadois-onboarding-completed',
  authToken: 'entrenos-token',
  member: 'entrenos-member',
  streak: 'entrenos-streak',
  temperamentAnswers: 'app-do-amor-temperaments',
} as const

export function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

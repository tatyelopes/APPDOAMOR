import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}

export function matchesPassword(password, storedHash) {
  const [salt, expected] = storedHash.split(':')
  return timingSafeEqual(Buffer.from(expected, 'hex'), scryptSync(password, salt, 64))
}

// Simple in-memory rate limiter for registration attempts
// Tracks failed attempts per identifier (e.g. IP address)
// Locks the identifier for LOCK_DURATION_MS after MAX_ATTEMPTS failures.

const MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 30 * 60 * 1000 // 30 minutes
const ATTEMPT_WINDOW_MS = 30 * 60 * 1000 // 30 minutes window for counting failures

interface AttemptRecord {
  failures: number
  firstFailureAt: number
  lockedUntil: number | null
}

const store = new Map<string, AttemptRecord>()

export interface RateLimitStatus {
  allowed: boolean
  remainingAttempts: number
  lockedUntil: number | null
  retryAfterMs: number
}

export function checkRegistrationLimit(identifier: string): RateLimitStatus {
  const now = Date.now()
  const record = store.get(identifier)

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null, retryAfterMs: 0 }
  }

  // If currently locked
  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: record.lockedUntil,
      retryAfterMs: record.lockedUntil - now,
    }
  }

  // Lock expired - reset
  if (record.lockedUntil && now >= record.lockedUntil) {
    store.delete(identifier)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null, retryAfterMs: 0 }
  }

  // Failure window expired - reset
  if (now - record.firstFailureAt > ATTEMPT_WINDOW_MS) {
    store.delete(identifier)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null, retryAfterMs: 0 }
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.failures),
    lockedUntil: null,
    retryAfterMs: 0,
  }
}

export function recordRegistrationFailure(identifier: string): RateLimitStatus {
  const now = Date.now()
  const existing = store.get(identifier)

  let record: AttemptRecord
  if (!existing || (existing.lockedUntil && now >= existing.lockedUntil) || (now - existing.firstFailureAt > ATTEMPT_WINDOW_MS)) {
    record = { failures: 1, firstFailureAt: now, lockedUntil: null }
  } else {
    record = { ...existing, failures: existing.failures + 1 }
  }

  if (record.failures >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCK_DURATION_MS
  }

  store.set(identifier, record)

  return {
    allowed: !record.lockedUntil,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.failures),
    lockedUntil: record.lockedUntil,
    retryAfterMs: record.lockedUntil ? record.lockedUntil - now : 0,
  }
}

export function clearRegistrationFailures(identifier: string): void {
  store.delete(identifier)
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}

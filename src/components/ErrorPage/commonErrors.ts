// To be extended when we need to identify errors triggered in our codebase
// Allow to show a specific error message and not a generic one

export class BaseError extends Error {
  public readonly isBaseError = true
  constructor(
    public readonly name: string,
    message: string,
  ) {
    super(message)
    this.name = name
  }
}

/**
 * Normalizes an unknown thrown value into an Error instance.
 * Handles null, undefined, strings, and arbitrary objects.
 * Plain objects are JSON-stringified to preserve diagnostic info.
 */
export const toError = (value: unknown): Error => {
  if (value instanceof Error) return value
  if (typeof value === 'string') return new Error(value)
  if (typeof value === 'object' && value !== null) {
    try {
      return new Error(JSON.stringify(value))
    } catch {
      return new Error(String(value))
    }
  }
  return new Error(String(value))
}

/** UX copy when the user dismisses or rejects a wallet transaction prompt. */
export const USER_CANCELED_TX_MESSAGE = 'Transaction canceled by user'

/**
 * Error shaped like a wallet/user rejection so `executeTxFlow` can treat it as non-actionable.
 */
export const createUserCanceledTxError = (): Error => {
  const err = new Error(USER_CANCELED_TX_MESSAGE)
  return Object.assign(err, { cause: { code: 4001 as const } })
}

const USER_REJECTION_MESSAGE_MARKERS = [
  'user rejected the request',
  'user rejected',
  'rejected the transaction',
  'transaction rejected',
  'denied transaction',
  'request rejected',
  USER_CANCELED_TX_MESSAGE.toLowerCase(),
  'transaction cancelled by user',
  'user rejected transaction',
  // Some connectors return no hash on dismiss and surface internal wording instead of 4001
  'hash is null',
  'hash is undefined',
  'transaction hash is null',
  'transaction hash is undefined',
] as const

/**
 * Detects if an error represents a user-rejected wallet transaction
 * (e.g. MetaMask "User rejected the request", viem `UserRejectedRequestError`, EIP-1193 code 4001).
 * Accepts `unknown` for compatibility with catch blocks and react-error-boundary FallbackProps.
 */
export const isUserRejectedTxError = (error: unknown, depth = 0): boolean => {
  if (error === null || error === undefined || depth > 6) return false

  if (typeof error === 'object' && error !== null) {
    const rec = error as Record<string, unknown>

    if (rec.code === 4001) return true
    if (rec.name === 'UserRejectedRequestError') return true

    const msg = rec.message
    if (typeof msg === 'string') {
      const lower = msg.toLowerCase()
      for (const marker of USER_REJECTION_MESSAGE_MARKERS) {
        if (lower.includes(marker)) return true
      }
    }

    const shortMessage = rec.shortMessage
    if (typeof shortMessage === 'string' && shortMessage.toLowerCase().includes('reject')) return true

    const cause = rec.cause
    if (cause !== null && cause !== undefined) {
      return isUserRejectedTxError(cause, depth + 1)
    }
  }

  return false
}

/**
 * Detects if an error is a ChunkLoadError (failed to load a dynamic import chunk).
 * Accepts `unknown` to align with react-error-boundary v6.1+ FallbackProps.
 * This typically happens after deployments when old chunks are no longer available,
 * or due to network issues (e.g., 502 errors).
 */
export const isChunkLoadError = (error: unknown): boolean => {
  const normalized = toError(error)
  const errorStr = normalized.toString()
  const errorName = normalized.name || ''
  const errorMessage = normalized.message || ''

  return (
    errorName === 'ChunkLoadError' ||
    errorStr.includes('ChunkLoadError') ||
    errorStr.includes('Loading chunk') ||
    errorMessage.includes('Loading chunk') ||
    errorMessage.includes('Failed to fetch dynamically imported module') ||
    errorMessage.includes('_next/static/chunks')
  )
}

/**
 * Storage key for tracking chunk reload attempts
 * Used to prevent infinite reload loops
 */
const CHUNK_RELOAD_KEY = 'chunk_reload_attempt'
const MAX_RELOAD_ATTEMPTS = 2
const RELOAD_ATTEMPT_EXPIRY_MS = 30000 // 30 seconds

/**
 * Gets the current reload attempt count from sessionStorage
 */
const getReloadAttemptCount = (): number => {
  if (typeof window === 'undefined') return 0
  try {
    const stored = sessionStorage.getItem(CHUNK_RELOAD_KEY)
    if (!stored) return 0
    const { count, timestamp } = JSON.parse(stored)
    // Reset if expired
    if (Date.now() - timestamp > RELOAD_ATTEMPT_EXPIRY_MS) {
      sessionStorage.removeItem(CHUNK_RELOAD_KEY)
      return 0
    }
    return count
  } catch {
    return 0
  }
}

/**
 * Increments the reload attempt count in sessionStorage
 */
const incrementReloadAttempt = (): number => {
  if (typeof window === 'undefined') return 0
  const newCount = getReloadAttemptCount() + 1
  try {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, JSON.stringify({ count: newCount, timestamp: Date.now() }))
  } catch {
    // Ignore storage errors
  }
  return newCount
}

/**
 * Clears the reload attempt counter
 */
export const clearChunkReloadAttempts = (): void => {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY)
  } catch {
    // Ignore storage errors
  }
}

/**
 * Attempts to recover from a ChunkLoadError by reloading the page.
 * Returns true if a reload was triggered, false if max attempts reached.
 */
export const attemptChunkReloadRecovery = (): boolean => {
  const attempts = incrementReloadAttempt()
  if (attempts <= MAX_RELOAD_ATTEMPTS) {
    // Force a hard reload to get fresh chunks
    window.location.reload()
    return true
  }
  return false
}

/**
 * Checks if we should attempt automatic recovery for a ChunkLoadError
 */
export const shouldAttemptChunkRecovery = (): boolean => {
  return getReloadAttemptCount() < MAX_RELOAD_ATTEMPTS
}

export const commonErrors = {
  ProviderNotFoundError: 'Your browser does not have a wallet installed.',
  ChunkLoadError:
    'A new version of the application is available. The page will reload to get the latest version.',
}

/**
 * Maps a thrown value to a user-friendly message for known error types,
 * or falls back to the stringified error.
 */
export const checkForCommonErrors = (error: unknown): string => {
  if (isChunkLoadError(error)) {
    return commonErrors.ChunkLoadError
  }

  const normalized = toError(error)
  const errorStr = normalized.toString()
  const errorName = errorStr.replace(/^Error:\s*/, '').split(':')[0]

  if (errorName in commonErrors) {
    return commonErrors[errorName as keyof typeof commonErrors]
  }

  return errorStr
}

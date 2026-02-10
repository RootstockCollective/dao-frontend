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

export const isUserRejectedTxError = (error: any): boolean => {
  return (
    (error && typeof error.message === 'string' && error.message.includes('User rejected the request')) ||
    (error && error?.cause?.code === 4001)
  )
}

/**
 * Detects if an error is a ChunkLoadError (failed to load a dynamic import chunk)
 * This typically happens after deployments when old chunks are no longer available,
 * or due to network issues (e.g., 502 errors)
 */
export const isChunkLoadError = (error: Error): boolean => {
  const errorStr = error.toString()
  const errorName = error.name || ''
  const errorMessage = error.message || ''

  return (
    errorName === 'ChunkLoadError' ||
    errorStr.includes('ChunkLoadError') ||
    errorStr.includes('Loading chunk') ||
    errorMessage.includes('Loading chunk') ||
    errorMessage.includes('Failed to fetch dynamically imported module') ||
    // Next.js specific chunk loading patterns
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

export const checkForCommonErrors = (error: Error): string => {
  const errorStr = error.toString()

  // Check for ChunkLoadError first (special handling)
  if (isChunkLoadError(error)) {
    return commonErrors.ChunkLoadError
  }

  // Remove the leading 'Error: ' and extract the error name
  const errorName = errorStr.replace(/^Error:\s*/, '').split(':')[0]

  if (errorName in commonErrors) {
    return commonErrors[errorName as keyof typeof commonErrors]
  }

  return errorStr
}

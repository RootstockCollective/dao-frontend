interface RateLimitConfig {
  limit: number
  windowMs: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetMs: number
}

interface Bucket {
  /** The window this bucket was last checked with, so cleanup can prune it by its own window. */
  windowMs: number
  timestamps: number[]
}

const store = new Map<string, Bucket>()

let callsSinceCleanup = 0

const CLEANUP_INTERVAL = 50
const MAX_KEYS = 50_000

// Each bucket is pruned by its own window. Pruning all of them by the caller's would let a busy
// short-window prefix erase the history of a long-window one, and with it that prefix's limit.
function cleanup(now: number): void {
  for (const [key, bucket] of store) {
    const valid = bucket.timestamps.filter(t => now - t < bucket.windowMs)
    if (valid.length === 0) {
      store.delete(key)
    } else {
      bucket.timestamps = valid
    }
  }
}

function enforceMaxKeys(): void {
  if (store.size < MAX_KEYS) return

  const keysToRemove = store.size - MAX_KEYS + 1
  let removed = 0

  for (const key of store.keys()) {
    store.delete(key)
    removed++
    if (removed >= keysToRemove) break
  }
}

/**
 * Sliding window rate limiter backed by an in-memory Map.
 *
 * @param key    - Unique identifier for the rate-limit bucket (e.g. IP address)
 * @param prefix - Namespace prefix to isolate different endpoints
 * @param config - { limit, windowMs } for the sliding window
 */
export function checkRateLimit(key: string, prefix: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const bucketKey = `${prefix}:${key}`

  callsSinceCleanup++

  if (callsSinceCleanup >= CLEANUP_INTERVAL) {
    cleanup(now)
    callsSinceCleanup = 0
  }
  enforceMaxKeys()

  const timestamps = store.get(bucketKey)?.timestamps ?? []
  const windowStart = now - config.windowMs
  const valid = timestamps.filter(t => t > windowStart)

  if (valid.length >= config.limit) {
    const oldestInWindow = valid[0]
    const resetMs = oldestInWindow + config.windowMs - now

    return { success: false, limit: config.limit, remaining: 0, resetMs }
  }

  valid.push(now)
  store.set(bucketKey, { windowMs: config.windowMs, timestamps: valid })

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - valid.length,
    resetMs: config.windowMs,
  }
}

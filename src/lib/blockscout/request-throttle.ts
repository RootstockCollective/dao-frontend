import { isBlockscoutProApiEnabled } from './blockscout-api'

/**
 * ~1.5 req/s. Not a tolerance so much as damage control: an unauthenticated caller gets roughly
 * 10 requests per 16-minute window per IP, so no pacing makes a public instance workable — this
 * only keeps us from burning the window instantly.
 */
const DEFAULT_PUBLIC_MIN_INTERVAL_MS = 650

/** 4 req/s, one under the PRO free tier's 5 RPS so a burst does not sit exactly on the limit. */
const DEFAULT_PRO_MIN_INTERVAL_MS = 250

function defaultMinIntervalMs(): number {
  return isBlockscoutProApiEnabled() ? DEFAULT_PRO_MIN_INTERVAL_MS : DEFAULT_PUBLIC_MIN_INTERVAL_MS
}

/** The budget is per IP, so parallelism buys nothing and only wastes it in bursts. */
const DEFAULT_MAX_CONCURRENCY = 1
const DEFAULT_MAX_ATTEMPTS = 4
const DEFAULT_MAX_BACKOFF_MS = 8_000

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])

export interface BlockscoutThrottleConfig {
  /** Minimum delay between the *starts* of two Blockscout requests. */
  minIntervalMs: number
  /** Maximum simultaneous in-flight Blockscout requests. */
  maxConcurrency: number
  /** Total attempts per request, including the first. */
  maxAttempts: number
  /** Upper bound for any retry delay, including server-provided ones. */
  maxBackoffMs: number
}

const isTestEnv = process.env.NODE_ENV === 'test'

function numberFromEnv(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

function defaultConfig(): BlockscoutThrottleConfig {
  return {
    minIntervalMs: isTestEnv
      ? 0
      : numberFromEnv(process.env.BLOCKSCOUT_MIN_INTERVAL_MS, defaultMinIntervalMs()),
    maxConcurrency: Math.max(
      1,
      numberFromEnv(process.env.BLOCKSCOUT_MAX_CONCURRENCY, DEFAULT_MAX_CONCURRENCY),
    ),
    // Tests assert on single-response behaviour; retrying there only adds wall-clock time.
    maxAttempts: isTestEnv
      ? 1
      : Math.max(1, numberFromEnv(process.env.BLOCKSCOUT_MAX_ATTEMPTS, DEFAULT_MAX_ATTEMPTS)),
    maxBackoffMs: numberFromEnv(process.env.BLOCKSCOUT_MAX_BACKOFF_MS, DEFAULT_MAX_BACKOFF_MS),
  }
}

let config = defaultConfig()

let activeRequests = 0
let lastStartedAt = 0
/** Set when a 429 is observed; blocks every caller in this process until it passes. */
let cooldownUntil = 0
const queue: Array<() => void> = []

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

/** Overrides throttle settings. Intended for tests and for ops tuning at boot. */
export function configureBlockscoutThrottle(overrides: Partial<BlockscoutThrottleConfig>): void {
  config = { ...config, ...overrides }
}

/** Restores env/defaults and clears queue state. Intended for tests. */
export function resetBlockscoutThrottle(): void {
  config = defaultConfig()
  activeRequests = 0
  lastStartedAt = 0
  cooldownUntil = 0
  queue.length = 0
}

export function getBlockscoutThrottleConfig(): Readonly<BlockscoutThrottleConfig> {
  return config
}

async function acquireSlot(): Promise<void> {
  if (activeRequests >= config.maxConcurrency) {
    await new Promise<void>(resolve => queue.push(resolve))
  }
  activeRequests += 1

  // Hold the slot while pacing, so the interval applies to real request starts.
  for (;;) {
    const now = Date.now()
    const nextAllowedAt = Math.max(lastStartedAt + config.minIntervalMs, cooldownUntil)
    if (now >= nextAllowedAt) {
      break
    }
    await sleep(nextAllowedAt - now)
  }

  lastStartedAt = Date.now()
}

function releaseSlot(): void {
  activeRequests -= 1
  queue.shift()?.()
}

/**
 * Computes how long to wait before the next attempt.
 *
 * Prefers server guidance (`Retry-After` in seconds or HTTP date, then `x-ratelimit-reset` in ms),
 * falling back to exponential backoff with jitter. Always clamped to {@link BlockscoutThrottleConfig.maxBackoffMs}.
 */
function retryDelayMs(response: Response | undefined, attempt: number): number {
  const headers = response?.headers

  const retryAfter = headers?.get('retry-after')
  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds)) {
      return Math.min(Math.max(seconds * 1_000, 0), config.maxBackoffMs)
    }
    const dateMs = Date.parse(retryAfter)
    if (!Number.isNaN(dateMs)) {
      return Math.min(Math.max(dateMs - Date.now(), 0), config.maxBackoffMs)
    }
  }

  const rateLimitReset = Number(headers?.get('x-ratelimit-reset'))
  if (Number.isFinite(rateLimitReset) && rateLimitReset > 0) {
    return Math.min(rateLimitReset, config.maxBackoffMs)
  }

  const base = Math.min(config.maxBackoffMs, (config.minIntervalMs || 250) * 2 ** attempt)
  return base / 2 + Math.random() * (base / 2)
}

/** Frees the socket for responses we are about to discard and retry. */
async function discardBody(response: Response): Promise<void> {
  try {
    await response.arrayBuffer()
  } catch {
    // Nothing to release.
  }
}

export interface ThrottledFetchOptions {
  /**
   * Per-attempt network deadline, measured from the moment the request leaves the queue.
   *
   * Must not be expressed as an `AbortSignal` on `init`: a signal created at call time would also
   * count the queue wait and every preceding retry's backoff against the network budget, so a
   * request that waited its turn would abort the instant it was finally allowed to run.
   */
  timeoutMs?: number
}

/**
 * Builds the signal for a single attempt: a fresh deadline, plus the caller's own signal when it
 * supplied one, so caller-driven cancellation still works without leaking across attempts.
 */
function attemptSignal(callerSignal: AbortSignal | null | undefined, timeoutMs: number | undefined) {
  const deadline = timeoutMs === undefined ? undefined : AbortSignal.timeout(timeoutMs)
  if (!callerSignal) {
    return deadline
  }
  return deadline ? AbortSignal.any([callerSignal, deadline]) : callerSignal
}

/**
 * Performs a Blockscout request through the shared paced queue, retrying on 429 and transient 5xx.
 *
 * @param url — Absolute Blockscout API URL.
 * @param init — Passed straight to `fetch` (including Next.js `next.revalidate`). Any `signal` here
 *   is treated as caller-driven cancellation and composed with each attempt's deadline; pass the
 *   deadline itself via {@link ThrottledFetchOptions.timeoutMs}, never as a pre-built timeout signal.
 * @param options — Throttle-aware knobs; see {@link ThrottledFetchOptions}.
 * @returns The first successful response, or — once retries are exhausted — the last response
 *   received, unread. Callers keep ownership of `response.ok` handling, so error messages and
 *   status inspection stay exactly as they were before throttling was introduced.
 * @throws The last transport error, when no attempt produced a response at all.
 */
export async function throttledBlockscoutFetch(
  url: string,
  init?: RequestInit,
  options?: ThrottledFetchOptions,
): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt < config.maxAttempts; attempt += 1) {
    await acquireSlot()

    let response: Response | undefined
    try {
      // Built after acquireSlot() so the deadline covers only this attempt's network time.
      response = await fetch(url, { ...init, signal: attemptSignal(init?.signal, options?.timeoutMs) })
    } catch (err) {
      lastError = err
    } finally {
      releaseSlot()
    }

    const isLastAttempt = attempt === config.maxAttempts - 1

    if (response) {
      if (response.ok || !RETRYABLE_STATUSES.has(response.status)) {
        return response
      }

      if (response.status === 429) {
        // Back every other caller off too: the budget is shared across the process.
        cooldownUntil = Math.max(cooldownUntil, Date.now() + retryDelayMs(response, attempt))
      }

      // Hand the failure back untouched so the caller owns the error message. Caller-driven
      // cancellation ends the sequence the same way: returning the response it already paid for
      // beats discarding it to throw a generic error.
      if (isLastAttempt || init?.signal?.aborted) {
        return response
      }

      await discardBody(response)
    }

    if (isLastAttempt) {
      break
    }

    // Caller-driven cancellation is final; only our own per-attempt deadline is worth retrying.
    if (init?.signal?.aborted) {
      break
    }

    await sleep(retryDelayMs(response, attempt))
  }

  throw lastError instanceof Error ? lastError : new Error('Blockscout request failed')
}

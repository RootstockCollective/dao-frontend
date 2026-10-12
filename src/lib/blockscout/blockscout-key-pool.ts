/**
 * Round-robin pool over one or more Blockscout PRO API keys.
 *
 * ## Why rotate
 *
 * A single free-tier key allows 5 rps and roughly 5,000 standard requests a day, which is well
 * under what the app consumes at a 60-second refresh. Spreading consecutive requests across N keys
 * raises the ceiling while the data moves to the indexer.
 *
 * @remarks
 * **Keys must come from separate accounts to multiply the budget.** Blockscout caps rps per key but
 * meters credits per plan, so N keys on one account would raise throughput while leaving the daily
 * allowance untouched — and the allowance is the binding constraint here. The deployed keys are
 * issued from different accounts for that reason; {@link readCreditsRemaining} exposes
 * `x-credits-remaining` so the assumption stays checkable rather than remembered.
 *
 * **Cooldowns are per key, not global.** One key hitting its limit says nothing about the others,
 * so a 429 parks only the key that earned it; rotation then skips it until it recovers. Parking all
 * of them would throw away the whole point of holding several.
 */

/** Last resort when every key is cooling down: keep serving rather than fail the request outright. */
const MIN_USABLE_KEYS = 1

interface KeyState {
  key: string
  /** Epoch ms before which this key should not be used again. */
  cooldownUntil: number
}

let pool: KeyState[] = []
let poolSource = ''
let cursor = 0

/**
 * Parses the configured keys.
 *
 * Accepts a comma- or whitespace-separated list in `BLOCKSCOUT_API_KEY`, so a single key keeps
 * working unchanged and a list needs no new variable.
 */
function parseKeys(raw: string | undefined): string[] {
  if (!raw) {
    return []
  }
  return raw
    .split(/[,\s]+/)
    .map(key => key.trim())
    .filter(Boolean)
}

/** Rebuilds the pool when the configured value changes; preserves cooldowns for keys that stay. */
function syncPool(): void {
  const raw = process.env.BLOCKSCOUT_API_KEY ?? ''
  if (raw === poolSource) {
    return
  }

  const previous = new Map(pool.map(entry => [entry.key, entry.cooldownUntil]))
  pool = parseKeys(raw).map(key => ({ key, cooldownUntil: previous.get(key) ?? 0 }))
  poolSource = raw
  cursor = 0
}

/** @returns Every configured key, in order. Empty when the PRO API is not configured. */
export function getBlockscoutApiKeys(): string[] {
  syncPool()
  return pool.map(entry => entry.key)
}

/** @returns How many keys are configured; `0` means fall back to the public instance. */
export function getBlockscoutKeyCount(): number {
  return getBlockscoutApiKeys().length
}

/**
 * Takes the next key in rotation, skipping any that are cooling down.
 *
 * @returns The key to authenticate with, or `undefined` when none are configured.
 *
 * @remarks
 * When every key is cooling down it returns the one that recovers soonest rather than nothing: the
 * caller's own retry and backoff already handle a limited key, and refusing to answer here would
 * turn a slow request into a failed one.
 */
export function nextBlockscoutApiKey(): string | undefined {
  syncPool()
  if (pool.length === 0) {
    return undefined
  }

  const now = Date.now()

  for (let offset = 0; offset < pool.length; offset += 1) {
    const entry = pool[(cursor + offset) % pool.length]
    if (entry.cooldownUntil <= now) {
      cursor = (cursor + offset + 1) % pool.length
      return entry.key
    }
  }

  // Everything is parked: pick whichever frees up first so the wait is as short as possible.
  const soonest = pool.reduce((best, entry) => (entry.cooldownUntil < best.cooldownUntil ? entry : best))
  return soonest.key
}

/**
 * Parks a key after it was rate-limited, so rotation skips it until `durationMs` has passed.
 *
 * @param key — The key that received the 429; unknown keys are ignored.
 * @param durationMs — How long to avoid it, normally derived from the response's retry hints.
 */
export function cooldownBlockscoutApiKey(key: string | undefined, durationMs: number): void {
  if (!key || durationMs <= 0) {
    return
  }
  syncPool()

  const entry = pool.find(candidate => candidate.key === key)
  if (!entry) {
    return
  }

  // Never park the only key we have: with nothing to rotate to, a cooldown is just downtime, and
  // the caller's backoff already paces the retries.
  if (pool.length <= MIN_USABLE_KEYS) {
    return
  }

  entry.cooldownUntil = Math.max(entry.cooldownUntil, Date.now() + durationMs)
}

/** @returns Keys currently parked by a cooldown. Intended for diagnostics and tests. */
export function getCoolingDownKeys(): string[] {
  syncPool()
  const now = Date.now()
  return pool.filter(entry => entry.cooldownUntil > now).map(entry => entry.key)
}

/** Clears rotation state and cooldowns. Intended for tests. */
export function resetBlockscoutKeyPool(): void {
  pool = []
  poolSource = ''
  cursor = 0
}

/**
 * Reads Blockscout's remaining-credit hint from a response.
 *
 * @returns The credits left in the current window, or `undefined` when the header is absent.
 *
 * @remarks
 * This is the only honest way to tell whether adding keys actually raised the budget: if the
 * credits are metered per account rather than per key, the number falls at the same rate no matter
 * how many keys rotate.
 */
export function readCreditsRemaining(response: Response): number | undefined {
  const raw = response.headers?.get('x-credits-remaining')
  if (raw === null || raw === undefined) {
    return undefined
  }
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}

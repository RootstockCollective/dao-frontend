import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.resetModules()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function getRateLimiter() {
    const { checkRateLimit } = await import('./rateLimit')
    return checkRateLimit
  }

  it('allows requests within the limit and tracks remaining count', async () => {
    const checkRateLimit = await getRateLimiter()
    const config = { limit: 3, windowMs: 60_000 }

    const r1 = checkRateLimit('192.168.1.1', 'test', config)
    const r2 = checkRateLimit('192.168.1.1', 'test', config)
    const r3 = checkRateLimit('192.168.1.1', 'test', config)

    expect(r1).toMatchObject({ success: true, remaining: 2 })
    expect(r2).toMatchObject({ success: true, remaining: 1 })
    expect(r3).toMatchObject({ success: true, remaining: 0 })
  })

  it('rejects the request that exceeds the limit', async () => {
    const checkRateLimit = await getRateLimiter()
    const config = { limit: 2, windowMs: 60_000 }

    checkRateLimit('10.0.0.1', 'test', config)
    checkRateLimit('10.0.0.1', 'test', config)
    const result = checkRateLimit('10.0.0.1', 'test', config)

    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('returns the configured limit in every response', async () => {
    const checkRateLimit = await getRateLimiter()
    const config = { limit: 5, windowMs: 60_000 }

    const r1 = checkRateLimit('10.0.0.3', 'test', config)
    expect(r1.limit).toBe(5)

    for (let i = 0; i < 4; i++) checkRateLimit('10.0.0.3', 'test', config)

    const rejected = checkRateLimit('10.0.0.3', 'test', config)
    expect(rejected.limit).toBe(5)
  })

  it('resets after the window expires', async () => {
    const checkRateLimit = await getRateLimiter()
    const config = { limit: 1, windowMs: 60_000 }

    checkRateLimit('10.0.0.4', 'test', config)
    expect(checkRateLimit('10.0.0.4', 'test', config).success).toBe(false)

    vi.advanceTimersByTime(60_001)

    expect(checkRateLimit('10.0.0.4', 'test', config).success).toBe(true)
  })

  it('returns resetMs indicating when the window reopens', async () => {
    const checkRateLimit = await getRateLimiter()
    const config = { limit: 1, windowMs: 60_000 }

    vi.setSystemTime(1000)
    checkRateLimit('10.0.0.5', 'test', config)

    vi.setSystemTime(11_000)
    const result = checkRateLimit('10.0.0.5', 'test', config)

    expect(result.success).toBe(false)
    // oldest timestamp (1000) + window (60000) - now (11000) = 50000
    expect(result.resetMs).toBe(50_000)
  })

  it('isolates different prefixes for the same key', async () => {
    const checkRateLimit = await getRateLimiter()
    const config = { limit: 1, windowMs: 60_000 }

    checkRateLimit('10.0.0.6', 'auth_login', config)
    expect(checkRateLimit('10.0.0.6', 'auth_login', config).success).toBe(false)

    // Same IP, different prefix — should still succeed
    expect(checkRateLimit('10.0.0.6', 'auth_challenge', config).success).toBe(true)
  })

  it('isolates different keys for the same prefix', async () => {
    const checkRateLimit = await getRateLimiter()
    const config = { limit: 1, windowMs: 60_000 }

    checkRateLimit('10.0.0.7', 'test', config)
    expect(checkRateLimit('10.0.0.7', 'test', config).success).toBe(false)

    // Different IP, same prefix — should still succeed
    expect(checkRateLimit('10.0.0.8', 'test', config).success).toBe(true)
  })

  it('uses a sliding window, not a fixed window', async () => {
    const checkRateLimit = await getRateLimiter()
    const config = { limit: 2, windowMs: 60_000 }

    vi.setSystemTime(0)
    checkRateLimit('10.0.0.9', 'test', config)

    vi.setSystemTime(30_000)
    checkRateLimit('10.0.0.9', 'test', config)

    // At t=30s, both timestamps (t=0, t=30s) are within the 60s window
    expect(checkRateLimit('10.0.0.9', 'test', config).success).toBe(false)

    // At t=60.001s, the first timestamp (t=0) has expired, freeing one slot
    vi.setSystemTime(60_001)
    expect(checkRateLimit('10.0.0.9', 'test', config).success).toBe(true)
  })

  it("prunes each bucket by its own window, so a short-window prefix cannot reset a long one's", async () => {
    const checkRateLimit = await getRateLimiter()
    const long = { limit: 1, windowMs: 600_000 }
    const short = { limit: 1_000, windowMs: 60_000 }

    vi.setSystemTime(0)
    checkRateLimit('10.0.0.10', 'support', long)

    // Past the short window, then enough short-window traffic to trigger a cleanup pass.
    vi.setSystemTime(120_000)
    for (let i = 0; i < 60; i++) checkRateLimit(`10.0.1.${i}`, 'gauges', short)

    expect(checkRateLimit('10.0.0.10', 'support', long).success).toBe(false)
  })
})

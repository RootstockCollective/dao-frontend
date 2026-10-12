import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  configureBlockscoutThrottle,
  resetBlockscoutThrottle,
  throttledBlockscoutFetch,
} from './request-throttle'

const jsonResponse = (status: number, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify({ status: status === 200 ? '1' : '0', result: [] }), {
    status,
    headers,
  })

describe('throttledBlockscoutFetch', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    resetBlockscoutThrottle()
  })

  afterEach(() => {
    global.fetch = originalFetch
    resetBlockscoutThrottle()
  })

  it('returns a successful response without retrying', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200))
    global.fetch = fetchMock

    const response = await throttledBlockscoutFetch('https://blockscout.test/api')

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries on 429 and resolves once the rate limit clears', async () => {
    configureBlockscoutThrottle({ maxAttempts: 3, maxBackoffMs: 5, minIntervalMs: 0 })

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(429, { 'x-ratelimit-limit': '10' }))
      .mockResolvedValueOnce(jsonResponse(429, { 'x-ratelimit-limit': '10' }))
      .mockResolvedValueOnce(jsonResponse(200))
    global.fetch = fetchMock

    const response = await throttledBlockscoutFetch('https://blockscout.test/api')

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('returns the last response unread when retries are exhausted, leaving error handling to the caller', async () => {
    configureBlockscoutThrottle({ maxAttempts: 2, maxBackoffMs: 5, minIntervalMs: 0 })

    // A fresh Response per attempt: reusing one object would leak `bodyUsed` across attempts.
    const fetchMock = vi.fn().mockImplementation(async () => jsonResponse(429))
    global.fetch = fetchMock

    const response = await throttledBlockscoutFetch('https://blockscout.test/api')

    expect(response.status).toBe(429)
    expect(response.bodyUsed).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not retry non-retryable statuses', async () => {
    configureBlockscoutThrottle({ maxAttempts: 4, maxBackoffMs: 5, minIntervalMs: 0 })

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(400))
    global.fetch = fetchMock

    const response = await throttledBlockscoutFetch('https://blockscout.test/api')

    expect(response.status).toBe(400)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('propagates transport errors after exhausting attempts', async () => {
    configureBlockscoutThrottle({ maxAttempts: 2, maxBackoffMs: 5, minIntervalMs: 0 })

    const fetchMock = vi.fn().mockRejectedValue(new Error('socket hang up'))
    global.fetch = fetchMock

    await expect(throttledBlockscoutFetch('https://blockscout.test/api')).rejects.toThrow('socket hang up')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('serializes concurrent calls and paces them by minIntervalMs', async () => {
    configureBlockscoutThrottle({ maxConcurrency: 1, minIntervalMs: 40, maxAttempts: 1 })

    let inFlight = 0
    let maxInFlight = 0
    const startTimes: number[] = []

    global.fetch = vi.fn().mockImplementation(async () => {
      startTimes.push(Date.now())
      inFlight += 1
      maxInFlight = Math.max(maxInFlight, inFlight)
      await new Promise(resolve => setTimeout(resolve, 5))
      inFlight -= 1
      return jsonResponse(200)
    })

    await Promise.all(
      Array.from({ length: 3 }, () => throttledBlockscoutFetch('https://blockscout.test/api')),
    )

    expect(maxInFlight).toBe(1)
    // Three requests at >=40ms spacing cannot finish faster than two intervals.
    expect(startTimes[2] - startTimes[0]).toBeGreaterThanOrEqual(70)
  })

  it('gives every attempt a fresh deadline instead of reusing an expiring one', async () => {
    configureBlockscoutThrottle({ maxAttempts: 3, maxBackoffMs: 30, minIntervalMs: 0 })

    const abortedOnEntry: boolean[] = []
    const fetchMock = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      abortedOnEntry.push(Boolean(init?.signal?.aborted))
      if (init?.signal?.aborted) {
        throw new Error('aborted before the attempt even started')
      }
      return abortedOnEntry.length < 3 ? jsonResponse(429) : jsonResponse(200)
    })
    global.fetch = fetchMock

    // Shorter than the backoff the two 429s will burn, so a single shared signal would expire.
    const response = await throttledBlockscoutFetch('https://blockscout.test/api', undefined, {
      timeoutMs: 20,
    })

    expect(abortedOnEntry).toEqual([false, false, false])
    expect(response.status).toBe(200)
  })

  it('starts the deadline when the request leaves the queue, not when it joins it', async () => {
    configureBlockscoutThrottle({ maxConcurrency: 1, minIntervalMs: 40, maxAttempts: 1 })

    const abortedOnEntry: boolean[] = []
    global.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      abortedOnEntry.push(Boolean(init?.signal?.aborted))
      return jsonResponse(200)
    })

    // Five paced requests take ~160ms to drain; a 50ms budget started at enqueue time would have
    // aborted everything from the second one onward.
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        throttledBlockscoutFetch('https://blockscout.test/api', undefined, { timeoutMs: 50 }),
      ),
    )

    expect(abortedOnEntry).toEqual([false, false, false, false, false])
    expect(responses.every(r => r.status === 200)).toBe(true)
  })

  it('honours a caller signal and stops retrying once it aborts', async () => {
    configureBlockscoutThrottle({ maxAttempts: 4, maxBackoffMs: 5, minIntervalMs: 0 })

    const controller = new AbortController()
    const fetchMock = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      if (init?.signal?.aborted) {
        throw new Error('caller aborted')
      }
      controller.abort()
      return jsonResponse(429)
    })
    global.fetch = fetchMock

    const response = await throttledBlockscoutFetch('https://blockscout.test/api', {
      signal: controller.signal,
    })

    // The 429 comes back untouched rather than burning the remaining attempts on a dead signal.
    expect(response.status).toBe(429)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('clamps an absurd x-ratelimit-reset to maxBackoffMs', async () => {
    configureBlockscoutThrottle({ maxAttempts: 2, maxBackoffMs: 30, minIntervalMs: 0 })

    // Mainnet Blockscout reports resets tens of minutes out; using it verbatim would hang the request.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(429, { 'x-ratelimit-reset': '2893988' }))
      .mockResolvedValueOnce(jsonResponse(200))
    global.fetch = fetchMock

    const startedAt = Date.now()
    const response = await throttledBlockscoutFetch('https://blockscout.test/api')

    expect(response.status).toBe(200)
    expect(Date.now() - startedAt).toBeLessThan(1_000)
  })
})

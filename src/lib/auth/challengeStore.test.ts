import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CHALLENGE_TTL_MS } from './challengeToken'

let redeemChallenge: typeof import('./challengeStore').redeemChallenge
const T0 = new Date('2026-01-01T00:00:00.000Z').getTime()

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(T0)
  vi.resetModules()
  ;({ redeemChallenge } = await import('./challengeStore'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('redeemChallenge', () => {
  it('redeems a challenge only once', () => {
    const expiresAt = T0 + CHALLENGE_TTL_MS

    expect(redeemChallenge('once', expiresAt)).toBe(true)
    expect(redeemChallenge('once', expiresAt)).toBe(false)
  })

  it('keeps a redeemed challenge until it expires, however many others are redeemed', () => {
    const expiresAt = T0 + CHALLENGE_TTL_MS
    redeemChallenge('first', expiresAt)

    for (let i = 0; i < 20_000; i++) {
      redeemChallenge(`other-${i}`, expiresAt)
    }
    vi.setSystemTime(expiresAt - 1)

    expect(redeemChallenge('first', expiresAt)).toBe(false)
  })

  it('forgets a challenge once it has expired', () => {
    redeemChallenge('expiring', T0 + CHALLENGE_TTL_MS)

    vi.setSystemTime(T0 + CHALLENGE_TTL_MS)

    expect(redeemChallenge('expiring', Date.now() + CHALLENGE_TTL_MS)).toBe(true)
  })

  it('forgets challenges redeemed out of expiry order once they have all expired', () => {
    redeemChallenge('issued-last', T0 + CHALLENGE_TTL_MS)
    redeemChallenge('issued-first', T0 + 10_000)

    vi.setSystemTime(T0 + CHALLENGE_TTL_MS)

    expect(redeemChallenge('issued-first', Date.now() + CHALLENGE_TTL_MS)).toBe(true)
    expect(redeemChallenge('issued-last', Date.now() + CHALLENGE_TTL_MS)).toBe(true)
  })
})

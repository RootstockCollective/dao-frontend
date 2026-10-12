import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  cooldownBlockscoutApiKey,
  getBlockscoutApiKeys,
  getBlockscoutKeyCount,
  getCoolingDownKeys,
  nextBlockscoutApiKey,
  readCreditsRemaining,
  resetBlockscoutKeyPool,
} from './blockscout-key-pool'

const setKeys = (value: string | undefined) => {
  if (value === undefined) {
    delete process.env.BLOCKSCOUT_API_KEY
  } else {
    process.env.BLOCKSCOUT_API_KEY = value
  }
}

const takeMany = (count: number) => Array.from({ length: count }, () => nextBlockscoutApiKey())

describe('blockscout key pool', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    resetBlockscoutKeyPool()
    setKeys(undefined)
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    resetBlockscoutKeyPool()
    vi.useRealTimers()
  })

  it('reports no keys when the PRO API is unconfigured', () => {
    expect(getBlockscoutKeyCount()).toBe(0)
    expect(nextBlockscoutApiKey()).toBeUndefined()
  })

  it('keeps a single key working exactly as before', () => {
    setKeys('proapi_one')

    expect(getBlockscoutApiKeys()).toEqual(['proapi_one'])
    expect(takeMany(3)).toEqual(['proapi_one', 'proapi_one', 'proapi_one'])
  })

  it('walks a comma-separated list in order and wraps around', () => {
    setKeys('key_a,key_b,key_c')

    expect(takeMany(7)).toEqual(['key_a', 'key_b', 'key_c', 'key_a', 'key_b', 'key_c', 'key_a'])
  })

  it('tolerates whitespace and stray separators in the configured list', () => {
    setKeys('  key_a ,, key_b   key_c  ')

    expect(getBlockscoutApiKeys()).toEqual(['key_a', 'key_b', 'key_c'])
  })

  it('skips a key that is cooling down and keeps serving from the rest', () => {
    setKeys('key_a,key_b,key_c')
    nextBlockscoutApiKey() // key_a

    cooldownBlockscoutApiKey('key_b', 60_000)

    expect(getCoolingDownKeys()).toEqual(['key_b'])
    // key_b is parked, so rotation goes straight to key_c and then back to key_a.
    expect(takeMany(4)).toEqual(['key_c', 'key_a', 'key_c', 'key_a'])
  })

  it('resumes using a key once its cooldown elapses', () => {
    vi.useFakeTimers()
    setKeys('key_a,key_b')

    cooldownBlockscoutApiKey('key_b', 5_000)
    expect(takeMany(2)).toEqual(['key_a', 'key_a'])

    vi.advanceTimersByTime(5_001)

    expect(getCoolingDownKeys()).toEqual([])
    // Order is deliberately not asserted: key_a was served out of turn while key_b was parked, so
    // key_b is next in line on recovery. What matters is that both are back in rotation.
    expect(takeMany(2).sort()).toEqual(['key_a', 'key_b'])
  })

  it('never parks the only key, since there is nothing to rotate to', () => {
    setKeys('proapi_one')

    cooldownBlockscoutApiKey('proapi_one', 60_000)

    // Parking it would be pure downtime; the caller's own backoff paces the retries instead.
    expect(getCoolingDownKeys()).toEqual([])
    expect(nextBlockscoutApiKey()).toBe('proapi_one')
  })

  it('still answers with the soonest-to-recover key when every key is parked', () => {
    setKeys('key_a,key_b')

    cooldownBlockscoutApiKey('key_a', 60_000)
    cooldownBlockscoutApiKey('key_b', 1_000)

    // Refusing here would turn a slow request into a failed one.
    expect(nextBlockscoutApiKey()).toBe('key_b')
  })

  it('picks up a changed key list without a restart, keeping existing cooldowns', () => {
    setKeys('key_a,key_b')
    cooldownBlockscoutApiKey('key_b', 60_000)

    setKeys('key_a,key_b,key_c')

    expect(getBlockscoutApiKeys()).toEqual(['key_a', 'key_b', 'key_c'])
    expect(getCoolingDownKeys()).toEqual(['key_b'])
  })

  it('reads the remaining-credit hint, which is how to tell if rotation raised the budget', () => {
    const withHeader = new Response('{}', { headers: { 'x-credits-remaining': '98450' } })
    expect(readCreditsRemaining(withHeader)).toBe(98450)

    expect(readCreditsRemaining(new Response('{}'))).toBeUndefined()
    expect(
      readCreditsRemaining(new Response('{}', { headers: { 'x-credits-remaining': 'n/a' } })),
    ).toBeUndefined()
  })
})

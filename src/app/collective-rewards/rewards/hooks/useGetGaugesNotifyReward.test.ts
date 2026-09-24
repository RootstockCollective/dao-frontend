import { type Address, getAddress } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchGaugesNotifyReward,
  matchesNotifyRewardFilter,
  type NotifyRewardEvent,
} from './useGetGaugesNotifyReward'

const GAUGE_A = '0x1111111111111111111111111111111111111111' as Address
const GAUGE_B = '0x3333333333333333333333333333333333333333' as Address
const TOKEN = '0x2222222222222222222222222222222222222222' as Address

const dtoEvent = { args: { rewardToken_: TOKEN, builderAmount_: '3', backersAmount_: '7' }, timeStamp: 100 }

const mockFetch = vi.fn()

function respondWith(body: unknown, init: { ok?: boolean; status?: number; statusText?: string } = {}) {
  mockFetch.mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    json: () => Promise.resolve(body),
  })
}

const calledUrl = () => new URL(mockFetch.mock.calls[0][0], 'http://localhost')

describe('fetchGaugesNotifyReward', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    vi.stubGlobal('fetch', mockFetch)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('does not call the route for an empty gauge list', async () => {
    expect(await fetchGaugesNotifyReward([])).toEqual({})
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('converts the decimal-string amounts to bigint', async () => {
    respondWith({ [GAUGE_A]: [dtoEvent] })

    const result = await fetchGaugesNotifyReward([GAUGE_A])

    expect(result[GAUGE_A]).toEqual([
      { args: { rewardToken_: TOKEN, builderAmount_: 3n, backersAmount_: 7n }, timeStamp: 100 },
    ])
  })

  it('keys every requested gauge, even one the response left out', async () => {
    respondWith({ [GAUGE_A]: [dtoEvent] })

    const result = await fetchGaugesNotifyReward([GAUGE_A, GAUGE_B])

    expect(result[GAUGE_B]).toEqual([])
  })

  it('sends fromTimestamp floored to whole seconds', async () => {
    respondWith({})

    await fetchGaugesNotifyReward([GAUGE_A, GAUGE_B], 1750000000.9)

    expect(calledUrl().searchParams.get('gauges')).toBe(`${GAUGE_A},${GAUGE_B}`)
    expect(calledUrl().searchParams.get('fromTimestamp')).toBe('1750000000')
  })

  it.each([undefined, 0])(
    'sends no fromTimestamp for %j, which means no lower bound',
    async fromTimestamp => {
      respondWith({})

      await fetchGaugesNotifyReward([GAUGE_A], fromTimestamp)

      expect(calledUrl().searchParams.has('fromTimestamp')).toBe(false)
    },
  )

  it('throws on a non-OK response, so the query errors instead of reporting zero', async () => {
    respondWith({ error: 'Failed' }, { ok: false, status: 503, statusText: 'Service Unavailable' })

    await expect(fetchGaugesNotifyReward([GAUGE_A])).rejects.toThrow('503 Service Unavailable')
  })
})

describe('matchesNotifyRewardFilter', () => {
  const event: NotifyRewardEvent = {
    args: { rewardToken_: TOKEN, builderAmount_: 1n, backersAmount_: 1n },
    timeStamp: 100,
  }

  it('matches everything without filters, and treats 0 timestamps as no bound', () => {
    expect(matchesNotifyRewardFilter(event, {})).toBe(true)
    expect(matchesNotifyRewardFilter(event, { fromTimestamp: 0, toTimestamp: 0 })).toBe(true)
  })

  it('compares reward tokens regardless of casing', () => {
    // state-sync hands tokens back lowercased; the screens filter by the checksummed constants.
    const lowercaseToken = '0xabcdef0123456789abcdef0123456789abcdef01' as Address
    const lowercaseEvent = { ...event, args: { ...event.args, rewardToken_: lowercaseToken } }

    expect(matchesNotifyRewardFilter(lowercaseEvent, { rewardTokens: [getAddress(lowercaseToken)] })).toBe(
      true,
    )
    expect(matchesNotifyRewardFilter(lowercaseEvent, { rewardTokens: [TOKEN] })).toBe(false)
  })

  it('includes both ends of the time window', () => {
    expect(matchesNotifyRewardFilter(event, { fromTimestamp: 100, toTimestamp: 100 })).toBe(true)
    expect(matchesNotifyRewardFilter(event, { fromTimestamp: 101 })).toBe(false)
    expect(matchesNotifyRewardFilter(event, { toTimestamp: 99 })).toBe(false)
  })
})

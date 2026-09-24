import type { Address } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockDb } = vi.hoisted(() => ({ mockDb: vi.fn() }))

vi.mock('@/lib/db', () => ({ db: (table: string) => mockDb(table) }))
vi.mock('@/lib/logger', () => ({ logger: { warn: vi.fn(), error: vi.fn() } }))
// Outside a Next request there is no incremental cache; the loader runs straight through.
vi.mock('next/cache', () => ({ unstable_cache: <T>(fn: T) => fn }))

import { fetchNotifyRewardFromStateSync } from './stateSync'

/** Records the chained calls and resolves to `rows`, so tests can assert on the query shape. */
function queryStub(rows: unknown[]) {
  const calls: { method: string; args: unknown[] }[] = []
  const chain: Record<string, unknown> = {
    then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(rows).then(resolve),
  }
  for (const method of ['select', 'whereIn', 'where', 'orderBy']) {
    chain[method] = (...args: unknown[]) => {
      calls.push({ method, args })
      return chain
    }
  }
  return { chain, calls }
}

const utf8 = (value: string) => Buffer.from(value, 'utf8')

const GAUGE_MIXED = '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01' as Address
const TOKEN = '0x2222222222222222222222222222222222222222'

/**
 * `Bytes` columns arrive as the decoded string, not a `Buffer`: `src/lib/dbUtils.ts` registers a
 * `bytea` parser for every connection `db` opens.
 */
function row(overrides: Record<string, unknown> = {}) {
  return {
    gauge: GAUGE_MIXED.toLowerCase(),
    rewardToken: TOKEN,
    builderAmount: '3000000000000000000',
    backersAmount: '7000000000000000000',
    blockTimestamp: '1750000000',
    ...overrides,
  }
}

describe('fetchNotifyRewardFromStateSync', () => {
  beforeEach(() => mockDb.mockReset())

  it('reads GaugeNotifyReward directly, since its rows are keyed by the emitting gauge', async () => {
    const stub = queryStub([])
    mockDb.mockReturnValue(stub.chain)

    await fetchNotifyRewardFromStateSync([GAUGE_MIXED])

    expect(mockDb).toHaveBeenCalledWith('GaugeNotifyReward')
  })

  it('matches gauges by their encoded bytes, lowercased, deduplicated and sorted', async () => {
    const stub = queryStub([])
    mockDb.mockReturnValue(stub.chain)
    const other = '0x1111111111111111111111111111111111111111' as Address

    await fetchNotifyRewardFromStateSync([GAUGE_MIXED, other, GAUGE_MIXED.toLowerCase() as Address])

    // One spelling per gauge, in a stable order, so every spelling of a set shares a cache entry.
    expect(stub.calls.find(c => c.method === 'whereIn')?.args).toEqual([
      'gauge',
      [utf8(other), utf8(GAUGE_MIXED.toLowerCase())],
    ])
  })

  it('bounds the query by fromTimestamp only when one is given', async () => {
    const bounded = queryStub([])
    mockDb.mockReturnValue(bounded.chain)
    await fetchNotifyRewardFromStateSync([GAUGE_MIXED], { fromTimestamp: 1750000000 })
    expect(bounded.calls.filter(c => c.method === 'where').map(c => c.args)).toEqual([
      ['blockTimestamp', '>=', 1750000000],
    ])

    const unbounded = queryStub([])
    mockDb.mockReturnValue(unbounded.chain)
    await fetchNotifyRewardFromStateSync([GAUGE_MIXED])
    expect(unbounded.calls.some(c => c.method === 'where')).toBe(false)
  })

  it("keys the response by the caller's own string, not the lowercased one from Postgres", async () => {
    mockDb.mockReturnValue(queryStub([row()]).chain)

    const result = await fetchNotifyRewardFromStateSync([GAUGE_MIXED])

    expect(Object.keys(result)).toEqual([GAUGE_MIXED])
    expect(result[GAUGE_MIXED]).toHaveLength(1)
  })

  it('gives every casing of the same gauge its events, instead of only the last one sent', async () => {
    const lower = GAUGE_MIXED.toLowerCase() as Address
    mockDb.mockReturnValue(queryStub([row()]).chain)

    const result = await fetchNotifyRewardFromStateSync([GAUGE_MIXED, lower, GAUGE_MIXED])

    expect(result[GAUGE_MIXED]).toHaveLength(1)
    expect(result[lower]).toHaveLength(1)
  })

  it('returns an entry for every requested gauge, even with no distributions', async () => {
    const other = '0x9999999999999999999999999999999999999999' as Address
    mockDb.mockReturnValue(queryStub([row()]).chain)

    const result = await fetchNotifyRewardFromStateSync([GAUGE_MIXED, other])

    expect(result[other]).toEqual([])
  })

  it('keeps the builder/backers split as decimal strings and the timestamp in seconds', async () => {
    mockDb.mockReturnValue(queryStub([row()]).chain)

    const [event] = (await fetchNotifyRewardFromStateSync([GAUGE_MIXED]))[GAUGE_MIXED]

    expect(event.args.rewardToken_).toBe(TOKEN)
    expect(BigInt(event.args.builderAmount_)).toBe(3n * 10n ** 18n)
    expect(BigInt(event.args.backersAmount_)).toBe(7n * 10n ** 18n)
    expect(event.timeStamp).toBe(1750000000)
  })

  it('still decodes a Buffer, for a connection without the bytea parser', async () => {
    mockDb.mockReturnValue(
      queryStub([row({ gauge: utf8(GAUGE_MIXED.toLowerCase()), rewardToken: utf8(TOKEN) })]).chain,
    )

    const [event] = (await fetchNotifyRewardFromStateSync([GAUGE_MIXED]))[GAUGE_MIXED]

    expect(event.args.rewardToken_).toBe(TOKEN)
  })

  it('drops a row whose reward token is not an address, so the client cannot throw on it', async () => {
    mockDb.mockReturnValue(queryStub([row({ rewardToken: 'not-an-address' }), row()]).chain)

    const result = await fetchNotifyRewardFromStateSync([GAUGE_MIXED])

    expect(result[GAUGE_MIXED].map(e => e.args.rewardToken_)).toEqual([TOKEN])
  })

  it('drops rows whose gauge was not requested instead of inventing a key', async () => {
    mockDb.mockReturnValue(queryStub([row({ gauge: '0xdeadbeef' })]).chain)

    const result = await fetchNotifyRewardFromStateSync([GAUGE_MIXED])

    expect(result).toEqual({ [GAUGE_MIXED]: [] })
  })
})

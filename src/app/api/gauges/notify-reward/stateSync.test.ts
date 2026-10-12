import type { Address } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockDb, mockFilterKnownGauges } = vi.hoisted(() => ({
  mockDb: vi.fn(),
  mockFilterKnownGauges: vi.fn(),
}))

vi.mock('@/lib/db', () => ({ db: (table: string) => mockDb(table) }))
vi.mock('@/lib/logger', () => ({ logger: { warn: vi.fn(), error: vi.fn() } }))
// Outside a Next request there is no incremental cache; the loader runs straight through.
vi.mock('next/cache', () => ({ unstable_cache: <T>(fn: T) => fn }))
vi.mock('../_lib/known-gauges', () => ({ filterKnownGauges: mockFilterKnownGauges }))

import { fetchNotifyRewardFromStateSync } from './stateSync'

/** Records the chained calls and resolves to `rows`, so tests can assert on the query shape. */
function queryStub(rows: unknown[]) {
  const calls: { method: string; args: unknown[] }[] = []
  const chain: Record<string, unknown> = {
    then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(rows).then(resolve),
  }
  for (const method of ['select', 'where', 'orderBy']) {
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
    rewardToken: TOKEN,
    builderAmount: '3000000000000000000',
    backersAmount: '7000000000000000000',
    blockTimestamp: '1750000000',
    ...overrides,
  }
}

describe('fetchNotifyRewardFromStateSync', () => {
  beforeEach(() => {
    mockDb.mockReset()
    mockFilterKnownGauges.mockReset()
    mockFilterKnownGauges.mockImplementation(async (gauges: string[]) => gauges)
  })

  it('reads GaugeNotifyReward directly, since its rows are keyed by the emitting gauge', async () => {
    const stub = queryStub([])
    mockDb.mockReturnValue(stub.chain)

    await fetchNotifyRewardFromStateSync([GAUGE_MIXED])

    expect(mockDb).toHaveBeenCalledWith('GaugeNotifyReward')
  })

  it('queries each gauge on its own, by its encoded bytes, lowercased and deduplicated', async () => {
    const stubs: ReturnType<typeof queryStub>[] = []
    mockDb.mockImplementation(() => {
      const stub = queryStub([])
      stubs.push(stub)
      return stub.chain
    })
    const other = '0x1111111111111111111111111111111111111111' as Address

    await fetchNotifyRewardFromStateSync([GAUGE_MIXED, other, GAUGE_MIXED.toLowerCase() as Address])

    // One cache entry per gauge, whatever set it was requested in.
    expect(stubs.map(stub => stub.calls.find(c => c.method === 'where')?.args)).toEqual([
      ['gauge', utf8(GAUGE_MIXED.toLowerCase())],
      ['gauge', utf8(other)],
    ])
  })

  it('skips gauges state-sync does not know, without querying them', async () => {
    const unknown = '0x1111111111111111111111111111111111111111' as Address
    mockFilterKnownGauges.mockResolvedValue([GAUGE_MIXED.toLowerCase()])
    mockDb.mockReturnValue(queryStub([row()]).chain)

    const result = await fetchNotifyRewardFromStateSync([GAUGE_MIXED, unknown])

    expect(mockFilterKnownGauges).toHaveBeenCalledWith([GAUGE_MIXED.toLowerCase(), unknown])
    expect(mockDb).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ [GAUGE_MIXED]: [expect.anything()], [unknown]: [] })
  })

  it('applies fromTimestamp after the cache, so it never reaches the query or the cache key', async () => {
    const stub = queryStub([row({ blockTimestamp: '1749999999' }), row({ blockTimestamp: '1750000000' })])
    mockDb.mockReturnValue(stub.chain)

    const result = await fetchNotifyRewardFromStateSync([GAUGE_MIXED], { fromTimestamp: 1750000000 })

    expect(stub.calls.filter(c => c.method === 'where').map(c => c.args)).toEqual([
      ['gauge', utf8(GAUGE_MIXED.toLowerCase())],
    ])
    expect(result[GAUGE_MIXED].map(e => e.timeStamp)).toEqual([1750000000])
  })

  it('returns the whole history when no fromTimestamp is given', async () => {
    mockDb.mockReturnValue(
      queryStub([row({ blockTimestamp: '1' }), row({ blockTimestamp: '1750000000' })]).chain,
    )

    const result = await fetchNotifyRewardFromStateSync([GAUGE_MIXED])

    expect(result[GAUGE_MIXED].map(e => e.timeStamp)).toEqual([1, 1750000000])
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
    mockDb.mockImplementation(() => queryStub([]).chain)

    const result = await fetchNotifyRewardFromStateSync([GAUGE_MIXED, other])

    expect(result).toEqual({ [GAUGE_MIXED]: [], [other]: [] })
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
    mockDb.mockReturnValue(queryStub([row({ rewardToken: utf8(TOKEN) })]).chain)

    const [event] = (await fetchNotifyRewardFromStateSync([GAUGE_MIXED]))[GAUGE_MIXED]

    expect(event.args.rewardToken_).toBe(TOKEN)
  })

  it('drops a row whose reward token is not an address, so the client cannot throw on it', async () => {
    mockDb.mockReturnValue(queryStub([row({ rewardToken: 'not-an-address' }), row()]).chain)

    const result = await fetchNotifyRewardFromStateSync([GAUGE_MIXED])

    expect(result[GAUGE_MIXED].map(e => e.args.rewardToken_)).toEqual([TOKEN])
  })
})

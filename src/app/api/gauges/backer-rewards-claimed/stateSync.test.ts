import type { Address } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockDb, mockFilterKnownGauges } = vi.hoisted(() => ({
  mockDb: vi.fn(),
  mockFilterKnownGauges: vi.fn(),
}))

vi.mock('@/lib/db', () => ({ db: (table: string) => mockDb(table) }))
// Outside a Next request there is no incremental cache; the loader runs straight through.
vi.mock('next/cache', () => ({ unstable_cache: <T>(fn: T) => fn }))
vi.mock('../_lib/known-gauges', () => ({ filterKnownGauges: mockFilterKnownGauges }))

import { fetchBackerRewardsClaimedFromStateSync } from './stateSync'

/** Records the chained calls and resolves to `rows`, so tests can assert on the query shape. */
function queryStub(rows: unknown[]) {
  const calls: { method: string; args: unknown[] }[] = []
  const chain: Record<string, unknown> = {
    then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(rows).then(resolve),
  }
  for (const method of ['join', 'select', 'where', 'whereNotNull', 'orderBy']) {
    chain[method] = (...args: unknown[]) => {
      calls.push({ method, args })
      return chain
    }
  }
  return { chain, calls }
}

const utf8 = (value: string) => Buffer.from(value, 'utf8')

const GAUGE_MIXED = '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01' as Address
const BACKER = '0x1111111111111111111111111111111111111111'
const TOKEN = '0x2222222222222222222222222222222222222222'

/**
 * `Bytes` columns arrive as the decoded string, not a `Buffer`: `src/lib/dbUtils.ts` registers a
 * `bytea` parser for every connection `db` opens.
 */
function row(overrides: Record<string, unknown> = {}) {
  return {
    backer: BACKER,
    rewardToken: TOKEN,
    amount: '1000000000000000000',
    blockTimestamp: '1750000000',
    ...overrides,
  }
}

describe('fetchBackerRewardsClaimedFromStateSync', () => {
  beforeEach(() => {
    mockDb.mockReset()
    mockFilterKnownGauges.mockReset()
    mockFilterKnownGauges.mockImplementation(async (gauges: string[]) => gauges)
  })

  it('excludes builder claims, which share the table and have a null backer', async () => {
    const stub = queryStub([row()])
    mockDb.mockReturnValue(stub.chain)

    await fetchBackerRewardsClaimedFromStateSync([GAUGE_MIXED])

    expect(stub.calls.some(c => c.method === 'whereNotNull' && c.args[0] === 'c.backer')).toBe(true)
  })

  it('bridges gauge to builder through GaugeToBuilder', async () => {
    const stub = queryStub([row()])
    mockDb.mockReturnValue(stub.chain)

    await fetchBackerRewardsClaimedFromStateSync([GAUGE_MIXED])

    expect(mockDb).toHaveBeenCalledWith('ClaimedRewardsHistory as c')
    const join = stub.calls.find(c => c.method === 'join')
    expect(join?.args).toEqual(['GaugeToBuilder as g', 'g.builder', '=', 'c.builder'])
  })

  it("keys the response by the caller's own string, not the lowercased one from Postgres", async () => {
    const stub = queryStub([row()])
    mockDb.mockReturnValue(stub.chain)

    const result = await fetchBackerRewardsClaimedFromStateSync([GAUGE_MIXED])

    expect(Object.keys(result)).toEqual([GAUGE_MIXED])
    expect(result[GAUGE_MIXED]).toHaveLength(1)
  })

  it('returns an entry for every requested gauge, even with no claims', async () => {
    const other = '0x9999999999999999999999999999999999999999' as Address
    mockDb.mockImplementation(() => queryStub([]).chain)

    const result = await fetchBackerRewardsClaimedFromStateSync([GAUGE_MIXED, other])

    expect(result).toEqual({ [GAUGE_MIXED]: [], [other]: [] })
  })

  it('decodes Bytes columns as text and keeps the amount as a decimal string', async () => {
    const stub = queryStub([row()])
    mockDb.mockReturnValue(stub.chain)

    const [event] = (await fetchBackerRewardsClaimedFromStateSync([GAUGE_MIXED]))[GAUGE_MIXED]

    expect(event.args.backer_).toBe(BACKER)
    expect(event.args.rewardToken_).toBe(TOKEN)
    expect(event.args.amount_).toBe('1000000000000000000')
    expect(BigInt(event.args.amount_)).toBe(10n ** 18n)
    expect(event.timeStamp).toBe(1750000000)
  })

  it('queries each gauge on its own, by its encoded bytes, lowercased and deduplicated', async () => {
    const stubs: ReturnType<typeof queryStub>[] = []
    mockDb.mockImplementation(() => {
      const stub = queryStub([])
      stubs.push(stub)
      return stub.chain
    })
    const other = '0x1111111111111111111111111111111111111111' as Address

    await fetchBackerRewardsClaimedFromStateSync([GAUGE_MIXED, other, GAUGE_MIXED.toLowerCase() as Address])

    // One cache entry per gauge, whatever set it was requested in.
    expect(stubs.map(stub => stub.calls.find(c => c.method === 'where')?.args)).toEqual([
      ['g.id', utf8(GAUGE_MIXED.toLowerCase())],
      ['g.id', utf8(other)],
    ])
  })

  it('skips gauges state-sync does not know, without querying them', async () => {
    const unknown = '0x9999999999999999999999999999999999999999' as Address
    mockFilterKnownGauges.mockResolvedValue([GAUGE_MIXED.toLowerCase()])
    mockDb.mockReturnValue(queryStub([row()]).chain)

    const result = await fetchBackerRewardsClaimedFromStateSync([GAUGE_MIXED, unknown])

    expect(mockFilterKnownGauges).toHaveBeenCalledWith([GAUGE_MIXED.toLowerCase(), unknown])
    expect(mockDb).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ [GAUGE_MIXED]: [expect.anything()], [unknown]: [] })
  })

  it('gives every casing of the same gauge its claims, instead of only the last one sent', async () => {
    const lower = GAUGE_MIXED.toLowerCase() as Address
    mockDb.mockReturnValue(queryStub([row()]).chain)

    const result = await fetchBackerRewardsClaimedFromStateSync([GAUGE_MIXED, lower, GAUGE_MIXED])

    expect(result[GAUGE_MIXED]).toHaveLength(1)
    expect(result[lower]).toHaveLength(1)
  })

  it('still decodes a Buffer, for a connection without the bytea parser', async () => {
    mockDb.mockReturnValue(queryStub([row({ backer: utf8(BACKER), rewardToken: utf8(TOKEN) })]).chain)

    const [event] = (await fetchBackerRewardsClaimedFromStateSync([GAUGE_MIXED]))[GAUGE_MIXED]

    expect(event.args.backer_).toBe(BACKER)
    expect(event.args.rewardToken_).toBe(TOKEN)
  })
})

import type { Address } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockDb } = vi.hoisted(() => ({ mockDb: vi.fn() }))

vi.mock('@/lib/db', () => ({ db: (table: string) => mockDb(table) }))

import { fetchNotifyRewardFromStateSync } from './stateSync'

/** Records the chained calls and resolves to `rows`, so tests can assert on the query shape. */
function queryStub(rows: unknown[]) {
  const calls: { method: string; args: unknown[] }[] = []
  const chain: Record<string, unknown> = {
    then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(rows).then(resolve),
  }
  for (const method of ['select', 'whereIn', 'orderBy']) {
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

function row(overrides: Record<string, unknown> = {}) {
  return {
    gauge: utf8(GAUGE_MIXED.toLowerCase()),
    rewardToken: utf8(TOKEN),
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

  it('matches gauges by their encoded bytes, lowercased', async () => {
    const stub = queryStub([])
    mockDb.mockReturnValue(stub.chain)

    await fetchNotifyRewardFromStateSync([GAUGE_MIXED])

    expect(stub.calls.find(c => c.method === 'whereIn')?.args).toEqual([
      'gauge',
      [utf8(GAUGE_MIXED.toLowerCase())],
    ])
  })

  it("keys the response by the caller's own string, not the lowercased one from Postgres", async () => {
    mockDb.mockReturnValue(queryStub([row()]).chain)

    const result = await fetchNotifyRewardFromStateSync([GAUGE_MIXED])

    expect(Object.keys(result)).toEqual([GAUGE_MIXED])
    expect(result[GAUGE_MIXED]).toHaveLength(1)
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

  it('drops rows whose gauge was not requested instead of inventing a key', async () => {
    mockDb.mockReturnValue(queryStub([row({ gauge: utf8('0xdeadbeef') })]).chain)

    const result = await fetchNotifyRewardFromStateSync([GAUGE_MIXED])

    expect(result).toEqual({ [GAUGE_MIXED]: [] })
  })
})

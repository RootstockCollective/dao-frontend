import { beforeEach, describe, expect, it, vi } from 'vitest'

const { queries, mockWarn } = vi.hoisted(() => ({
  queries: { rows: [] as unknown[], sql: [] as string[] },
  mockWarn: vi.fn(),
}))

/**
 * A real knex query builder for Postgres with no connection behind it: the SQL is compiled exactly
 * as in production, and awaiting the builder records that SQL and resolves to the rows under test.
 * A stub that only records method names would pass with SQL Postgres rejects.
 */
vi.mock('@/lib/db', async () => {
  const { default: knex } = await import('knex')
  const real = knex({ client: 'pg' })
  const db = (table: string) => {
    const builder = real(table)
    Object.assign(builder, {
      then: (resolve: (value: unknown[]) => unknown) => {
        queries.sql.push(builder.toString())
        return Promise.resolve(queries.rows).then(resolve)
      },
    })
    return builder
  }
  db.raw = real.raw.bind(real)
  return { db }
})
vi.mock('@/lib/logger', () => ({ logger: { warn: mockWarn, error: vi.fn() } }))

import { fetchRewardsDistributedFromStateSync } from './stateSync'

const RIF = '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
const USDRIF = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

function respondWith(rows: unknown[]) {
  queries.rows = rows
}

describe('fetchRewardsDistributedFromStateSync', () => {
  beforeEach(() => {
    queries.rows = []
    queries.sql = []
    mockWarn.mockReset()
  })

  it('sums what the gauges received, per token, in one query', async () => {
    await fetchRewardsDistributedFromStateSync()

    expect(queries.sql).toEqual([
      'select "GaugeNotifyReward"."rewardToken", sum("GaugeNotifyReward"."builderAmount" + "GaugeNotifyReward"."backersAmount") as "total" from "GaugeNotifyReward" group by "GaugeNotifyReward"."rewardToken"',
    ])
  })

  it('keys each total by its lowercased token', async () => {
    respondWith([
      { rewardToken: RIF, total: '300' },
      { rewardToken: USDRIF, total: '7' },
    ])

    const totals = await fetchRewardsDistributedFromStateSync()

    expect(totals).toEqual({ [RIF.toLowerCase()]: '300', [USDRIF]: '7' })
  })

  it('decodes a token that arrives as raw bytes', async () => {
    respondWith([{ rewardToken: Buffer.from(RIF, 'utf8'), total: '1' }])

    const totals = await fetchRewardsDistributedFromStateSync()

    expect(totals).toEqual({ [RIF.toLowerCase()]: '1' })
  })

  it('skips a row whose token is not an address instead of failing every other total', async () => {
    respondWith([
      { rewardToken: null, total: '9' },
      { rewardToken: '0x1234', total: '9' },
      { rewardToken: USDRIF, total: '7' },
    ])

    const totals = await fetchRewardsDistributedFromStateSync()

    expect(totals).toEqual({ [USDRIF]: '7' })
    expect(mockWarn).toHaveBeenCalledTimes(2)
  })

  it('passes NUMERIC totals through untouched, beyond Number precision', async () => {
    respondWith([{ rewardToken: RIF, total: '1636600000000000000000001' }])

    const totals = await fetchRewardsDistributedFromStateSync()

    expect(totals[RIF.toLowerCase()]).toBe('1636600000000000000000001')
  })

  it('reports zero rather than null when a group sums to nothing', async () => {
    respondWith([{ rewardToken: RIF, total: null }])

    const totals = await fetchRewardsDistributedFromStateSync()

    expect(totals[RIF.toLowerCase()]).toBe('0')
    expect(BigInt(totals[RIF.toLowerCase()])).toBe(0n)
  })
})

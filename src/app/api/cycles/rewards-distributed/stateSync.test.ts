import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockDb } = vi.hoisted(() => ({ mockDb: vi.fn() }))

vi.mock('@/lib/db', () => {
  const db = (table: string) => mockDb(table)
  db.raw = (sql: string) => ({ __raw: sql })
  return { db }
})

import { fetchRewardsDistributedFromStateSync } from './stateSync'

function queryStub(rows: unknown[]) {
  const calls: { method: string; args: unknown[] }[] = []
  const chain: Record<string, unknown> = {
    then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(rows).then(resolve),
  }
  for (const method of ['select', 'sum', 'groupBy']) {
    chain[method] = (...args: unknown[]) => {
      calls.push({ method, args })
      return chain
    }
  }
  return { chain, calls }
}

const RIF = '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

describe('fetchRewardsDistributedFromStateSync', () => {
  beforeEach(() => mockDb.mockReset())

  it('sums every cycle row per token', async () => {
    const stub = queryStub([{ token: RIF, total: '300' }])
    mockDb.mockReturnValue(stub.chain)

    const totals = await fetchRewardsDistributedFromStateSync()

    expect(mockDb).toHaveBeenCalledWith('CycleRewardPerToken')
    expect(stub.calls.find(c => c.method === 'sum')?.args).toEqual([{ total: 'amount' }])
    expect(stub.calls.find(c => c.method === 'groupBy')?.args).toEqual(['token'])
    expect(totals).toEqual({ [RIF.toLowerCase()]: '300' })
  })

  it('lowercases token keys so checksummed lookups from the token config hit', async () => {
    mockDb.mockReturnValue(queryStub([{ token: RIF, total: '1' }]).chain)

    const totals = await fetchRewardsDistributedFromStateSync()

    expect(Object.keys(totals)).toEqual([RIF.toLowerCase()])
  })

  it('reports zero rather than null when a group sums to nothing', async () => {
    mockDb.mockReturnValue(queryStub([{ token: RIF, total: null }]).chain)

    const totals = await fetchRewardsDistributedFromStateSync()

    expect(totals[RIF.toLowerCase()]).toBe('0')
    expect(BigInt(totals[RIF.toLowerCase()])).toBe(0n)
  })
})

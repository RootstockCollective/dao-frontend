import type { Address } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockDb } = vi.hoisted(() => ({ mockDb: vi.fn() }))

vi.mock('@/lib/db', () => {
  const db = (table: string) => mockDb(table)
  db.raw = (sql: string) => ({ __raw: sql })
  return { db }
})

import { fetchBuilderRewardsClaimedFromStateSync } from './stateSync'

function queryStub(rows: unknown[]) {
  const calls: { method: string; args: unknown[] }[] = []
  const chain: Record<string, unknown> = {
    then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(rows).then(resolve),
  }
  for (const method of ['join', 'select', 'where']) {
    chain[method] = (...args: unknown[]) => {
      calls.push({ method, args })
      return chain
    }
  }
  return { chain, calls }
}

const GAUGE = '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01' as Address
const RIF = '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

describe('fetchBuilderRewardsClaimedFromStateSync', () => {
  beforeEach(() => mockDb.mockReset())

  it('bridges gauge to builder, since the claims are keyed by builder', async () => {
    const stub = queryStub([{ token: RIF, amount: '5' }])
    mockDb.mockReturnValue(stub.chain)

    await fetchBuilderRewardsClaimedFromStateSync(GAUGE)

    expect(mockDb).toHaveBeenCalledWith('BuilderRewardsClaimed as b')
    expect(stub.calls.find(c => c.method === 'join')?.args).toEqual([
      'GaugeToBuilder as g',
      'g.builder',
      '=',
      'b.builder',
    ])
  })

  it('matches the gauge by its encoded bytes, lowercased', async () => {
    const stub = queryStub([])
    mockDb.mockReturnValue(stub.chain)

    await fetchBuilderRewardsClaimedFromStateSync(GAUGE)

    expect(stub.calls.find(c => c.method === 'where')?.args).toEqual([
      'g.id',
      Buffer.from(GAUGE.toLowerCase(), 'utf8'),
    ])
  })

  it('keys by lowercase token and keeps the amount as a decimal string', async () => {
    mockDb.mockReturnValue(queryStub([{ token: RIF, amount: '1000000000000000000' }]).chain)

    const claimed = await fetchBuilderRewardsClaimedFromStateSync(GAUGE)

    expect(claimed).toEqual({ [RIF.toLowerCase()]: '1000000000000000000' })
    expect(BigInt(claimed[RIF.toLowerCase()])).toBe(10n ** 18n)
  })

  it('returns nothing for a gauge whose builder has never claimed', async () => {
    mockDb.mockReturnValue(queryStub([]).chain)

    await expect(fetchBuilderRewardsClaimedFromStateSync(GAUGE)).resolves.toEqual({})
  })
})

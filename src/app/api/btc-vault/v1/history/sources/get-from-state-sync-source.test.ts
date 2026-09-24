import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { BtcVaultHistoryItem, BtcVaultHistoryItemWithStatus } from '../types'

const { mockDb } = vi.hoisted(() => ({ mockDb: vi.fn() }))

vi.mock('@/lib/db', () => ({ db: (table: string) => mockDb(table) }))

import { getFromStateSyncSource } from './get-from-state-sync-source'

/** Records the chained calls and resolves to `rows`, so tests can assert on the query shape. */
function queryStub(rows: unknown[], counterRow?: Record<string, unknown>) {
  const calls: { method: string; args: unknown[] }[] = []
  const chain: Record<string, unknown> = {
    then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(rows).then(resolve),
    first: async () => counterRow,
  }
  for (const method of ['select', 'whereIn', 'orderBy', 'limit', 'offset', 'where']) {
    chain[method] = (...args: unknown[]) => {
      calls.push({ method, args })
      return chain
    }
  }
  return { chain, calls }
}

const mapActionOnly = (item: BtcVaultHistoryItem): BtcVaultHistoryItemWithStatus => ({
  ...item,
  displayStatus: 'pending',
})

const source = getFromStateSyncSource({ mapActionOnly })

const PARAMS = { limit: 20, page: 1, sort_field: 'timestamp' as const, sort_direction: 'desc' as const }

function row(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: Buffer.from('deposit-0xabc-5-0', 'utf8'),
    user: Buffer.from('0xabc', 'utf8'),
    action: 'DEPOSIT_REQUEST',
    status: 'CLAIMABLE',
    assets: '1',
    shares: '0',
    epochId: '5',
    timestamp: '99',
    blockNumber: '7',
    transactionHash: Buffer.from('0xtx', 'utf8'),
    ...overrides,
  }
}

describe('getFromStateSyncSource', () => {
  beforeEach(() => mockDb.mockReset())

  it('throws when the database has nothing, so the cascade moves on', async () => {
    mockDb.mockImplementation((table: string) =>
      table === 'BtcVaultHistory' ? queryStub([]).chain : queryStub([], undefined).chain,
    )

    await expect(source.fetchPageAndTotal(PARAMS)).rejects.toThrow(/no BTC vault history rows/)
  })

  it('keeps an empty page when the counter says there are rows (past-the-end request)', async () => {
    mockDb.mockImplementation((table: string) =>
      table === 'BtcVaultHistory' ? queryStub([]).chain : queryStub([], { total: '42' }).chain,
    )

    await expect(source.fetchPageAndTotal({ ...PARAMS, page: 99 })).resolves.toEqual({
      items: [],
      total: 42,
    })
  })

  it('orders by a second key so rows cannot shift between pages', async () => {
    const history = queryStub([row()])
    mockDb.mockImplementation((table: string) =>
      table === 'BtcVaultHistory' ? history.chain : queryStub([], { total: '1' }).chain,
    )

    await source.fetchPageAndTotal(PARAMS)

    const orderBys = history.calls.filter(c => c.method === 'orderBy').map(c => c.args)
    expect(orderBys).toEqual([
      ['timestamp', 'desc'],
      ['id', 'asc'],
    ])
  })

  it('decodes Bytes columns as text and matches the address the same way', async () => {
    const history = queryStub([row()])
    mockDb.mockImplementation((table: string) =>
      table === 'BtcVaultHistory' ? history.chain : queryStub([], { total: '1' }).chain,
    )

    const { items } = await source.fetchPageAndTotal({ ...PARAMS, address: '0xABC' })

    expect(items[0].id).toBe('deposit-0xabc-5-0')
    expect(items[0].transactionHash).toBe('0xtx')
    const userFilter = history.calls.find(c => c.method === 'where')
    expect(userFilter?.args).toEqual(['user', Buffer.from('0xabc', 'utf8')])
  })

  it('sums the counter columns named by the type filter', async () => {
    mockDb.mockImplementation((table: string) =>
      table === 'BtcVaultHistory'
        ? queryStub([row()]).chain
        : queryStub([], { total: '99', depositRequests: '3', redeemsClaimed: '4' }).chain,
    )

    const { total } = await source.fetchPageAndTotal({
      ...PARAMS,
      type: ['deposit_request', 'redeem_claimed'],
    })

    expect(total).toBe(7)
  })

  it('reads displayStatus off the row instead of rebuilding request ids', async () => {
    const items = await source.enrichWithStatus([
      { ...row(), id: 'a', user: '0xabc', transactionHash: '0xtx' } as unknown as BtcVaultHistoryItem,
      {
        ...row({ action: 'REDEEM_REQUEST', status: 'CLAIMABLE' }),
        id: 'b',
        user: '0xabc',
        transactionHash: '0xtx',
      } as unknown as BtcVaultHistoryItem,
      {
        ...row({ action: 'DEPOSIT_CLAIMED', status: 'CLAIMED' }),
        id: 'c',
        user: '0xabc',
        transactionHash: '0xtx',
      } as unknown as BtcVaultHistoryItem,
    ])

    expect(items.map(i => i.displayStatus)).toEqual(['open_to_claim', 'claim_pending', 'successful'])
    expect(mockDb).not.toHaveBeenCalled()
  })

  it('falls back when the row carries no status', async () => {
    const items = await source.enrichWithStatus([
      {
        ...row({ status: undefined }),
        id: 'a',
        user: '0xabc',
        transactionHash: '0xtx',
      } as unknown as BtcVaultHistoryItem,
    ])

    expect(items[0].displayStatus).toBe('pending')
  })
})

import { print } from 'graphql'
import type { DocumentNode } from 'graphql'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Hoisted so `vi.mock` factories can reference stable spies (mock is hoisted above `const` init).
 * `importOriginal` + replacing `fetchBtcVaultHistoryFromBlockscout` does not affect the adapter
 * returned by the real `getFromBlockscoutSource` (it closed over the original function). We mock
 * `getFromBlockscoutSource` to wire `fetchPageAndTotal` to `mockBlockscout` instead.
 */
const { mockQuery, mockBlockscout, mockEnrichRpc } = vi.hoisted(() => {
  const mockEnrichRpcInner = vi.fn(
    async (
      history: {
        action: string
        user: string
        epochId: string
        assets: string
        shares: string
        id: string
        timestamp: number
        blockNumber: string
        transactionHash: string
      }[],
    ) =>
      history.map(item => {
        const row = { ...item } as typeof item & { displayStatus?: string }
        if (item.action === 'DEPOSIT_REQUEST' || item.action === 'REDEEM_REQUEST') {
          row.displayStatus = 'pending'
        } else if (item.action === 'DEPOSIT_CLAIMED' || item.action === 'REDEEM_CLAIMED') {
          row.displayStatus = 'successful'
        } else if (item.action === 'DEPOSIT_CANCELLED' || item.action === 'REDEEM_CANCELLED') {
          row.displayStatus = 'cancelled'
        }
        return row
      }),
  )
  return {
    mockQuery: vi.fn(),
    mockBlockscout: vi.fn(),
    mockEnrichRpc: mockEnrichRpcInner,
  }
})

vi.mock('@/shared/components/ApolloClient', () => ({
  btcVaultClient: {
    query: (...args: unknown[]) => mockQuery(...args),
  },
}))

vi.mock('./sources/get-from-blockscout-source', () => ({
  fetchBtcVaultHistoryFromBlockscout: (...args: unknown[]) => mockBlockscout(...args),
  getFromBlockscoutSource: vi.fn(() => ({
    name: 'blockscout' as const,
    fetchPageAndTotal: (params: unknown) => mockBlockscout(params),
    enrichWithStatus: async (items: unknown[]) =>
      // SAFETY: test double mirrors production `BtcVaultHistoryItem[]` from `action.ts`.
      mockEnrichRpc(items as never),
  })),
  enrichHistoryWithRpcRequestStatus: mockEnrichRpc,
}))

import {
  enrichHistoryWithRequestStatusSafe,
  fetchBtcVaultHistoryPageAndTotal,
} from './action'

describe('fetchBtcVaultHistoryPageAndTotal (DAO-2106)', () => {
  beforeEach(() => {
    mockQuery.mockReset()
    mockBlockscout.mockReset()
    mockEnrichRpc.mockClear()
  })

  it('returns subgraph list and count when both succeed', async () => {
    mockQuery.mockImplementation(async ({ query }: { query: DocumentNode }) => {
      const s = print(query)
      if (s.includes('btcVaultHistories')) {
        return {
          error: undefined,
          data: {
            btcVaultHistories: [
              {
                id: '1',
                user: '0xabc',
                action: 'DEPOSIT_REQUEST',
                assets: '1',
                shares: '0',
                epochId: '1',
                timestamp: 1,
                blockNumber: '1',
                transactionHash: '0xtx',
              },
            ],
          },
        }
      }
      if (s.includes('btcVaultHistoryCounter')) {
        return {
          error: undefined,
          data: {
            btcVaultHistoryCounter: {
              total: '10',
              depositRequests: '0',
              depositsClaimed: '0',
              depositsCancelled: '0',
              redeemRequests: '0',
              redeemsClaimed: '0',
              redeemsCancelled: '0',
            },
          },
        }
      }
      return { error: undefined, data: {} }
    })

    const result = await fetchBtcVaultHistoryPageAndTotal({
      limit: 20,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
      address: undefined,
    })

    expect(result.items).toHaveLength(1)
    expect(result.total).toBe(10)
    expect(result.source).toBe('the-graph')
    expect(result.errors).toEqual([])
    expect(mockBlockscout).not.toHaveBeenCalled()
  })

  it('falls back to Blockscout when subgraph list fails', async () => {
    mockQuery.mockRejectedValueOnce(new Error('subgraph down'))
    mockBlockscout.mockResolvedValue({
      items: [
        {
          id: 'x',
          user: '0xabc',
          action: 'DEPOSIT_REQUEST',
          assets: '1',
          shares: '0',
          epochId: '1',
          timestamp: 2,
          blockNumber: '2',
          transactionHash: '0xbb',
        },
      ],
      total: 1,
    })

    const result = await fetchBtcVaultHistoryPageAndTotal({
      limit: 20,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
    })

    expect(mockBlockscout).toHaveBeenCalledOnce()
    expect(result.items).toHaveLength(1)
    expect(result.total).toBe(1)
    expect(result.source).toBe('blockscout')
    expect(result.errors).toEqual([{ source: 'the-graph', message: 'subgraph down' }])
  })
})

describe('enrichHistoryWithRequestStatusSafe (DAO-2106)', () => {
  beforeEach(() => {
    mockQuery.mockReset()
  })

  it('falls back to action-only displayStatus when enrichment query fails', async () => {
    mockQuery.mockRejectedValueOnce(new Error('enrich failed'))

    const rows = [
      {
        id: '1',
        user: '0xabc',
        action: 'DEPOSIT_REQUEST' as const,
        assets: '1',
        shares: '0',
        epochId: '1',
        timestamp: 1,
        blockNumber: '1',
        transactionHash: '0xtx',
      },
    ]

    const out = await enrichHistoryWithRequestStatusSafe(rows)
    expect(out[0]?.displayStatus).toBe('pending')
  })
})

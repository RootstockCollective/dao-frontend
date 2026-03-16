import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/components/ApolloClient', () => ({
  btcVaultClient: {
    query: vi.fn(),
  },
}))

import { btcVaultClient } from '@/shared/components/ApolloClient'
import { getBtcVaultHistory, getBtcVaultHistoryCount } from './action'

const mockQuery = vi.mocked(btcVaultClient.query)

const mockHistoryItems = [
  {
    id: '0xabc-1',
    user: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
    action: 'DEPOSIT_REQUEST',
    assets: '1000000000000000000',
    shares: '500000000000000000',
    epochId: '1',
    timestamp: '1710000000',
    blockNumber: '7136040',
    transactionHash: '0x78f9b9aaa',
  },
  {
    id: '0xabc-2',
    user: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
    action: 'REDEEM_REQUEST',
    assets: '2000000000000000000',
    shares: '1000000000000000000',
    epochId: '2',
    timestamp: '1710100000',
    blockNumber: '7136080',
    transactionHash: '0x78f9b9bbb',
  },
]

const mockCounter = {
  total: '10',
  depositRequests: '3',
  depositsClaimed: '2',
  depositsCancelled: '1',
  redeemRequests: '2',
  redeemsClaimed: '1',
  redeemsCancelled: '1',
}

beforeEach(() => {
  mockQuery.mockReset()
})

describe('getBtcVaultHistory', () => {
  it('passes correct variables to the subgraph query', async () => {
    mockQuery.mockResolvedValue({ data: { btcVaultHistories: [] } } as never)

    await getBtcVaultHistory({
      address: '0xA18F4FBee88592Bee3D51D90Ba791E769a9B902F',
      limit: 20,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
    })

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          user: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
          first: 20,
          skip: 0,
          orderBy: 'timestamp',
          orderDirection: 'desc',
          actionFilter: [
            'DEPOSIT_REQUEST',
            'DEPOSIT_CLAIMED',
            'DEPOSIT_CANCELLED',
            'REDEEM_REQUEST',
            'REDEEM_CLAIMED',
            'REDEEM_CANCELLED',
          ],
        },
        fetchPolicy: 'no-cache',
      }),
    )
  })

  it('computes skip from page and limit', async () => {
    mockQuery.mockResolvedValue({ data: { btcVaultHistories: [] } } as never)

    await getBtcVaultHistory({
      address: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
      limit: 10,
      page: 3,
      sort_field: 'assets',
      sort_direction: 'asc',
    })

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          first: 10,
          skip: 20,
          orderBy: 'assets',
          orderDirection: 'asc',
        }),
      }),
    )
  })

  it('uppercases action type filter values', async () => {
    mockQuery.mockResolvedValue({ data: { btcVaultHistories: [] } } as never)

    await getBtcVaultHistory({
      address: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
      limit: 20,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
      type: ['deposit_request', 'redeem_claimed'],
    })

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          actionFilter: ['DEPOSIT_REQUEST', 'REDEEM_CLAIMED'],
        }),
      }),
    )
  })

  it('converts timestamp from string to number', async () => {
    mockQuery.mockResolvedValue({
      data: { btcVaultHistories: mockHistoryItems },
    } as never)

    const result = await getBtcVaultHistory({
      address: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
      limit: 20,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
    })

    expect(result[0].timestamp).toBe(1710000000)
    expect(result[1].timestamp).toBe(1710100000)
    expect(typeof result[0].timestamp).toBe('number')
  })

  it('returns empty array when subgraph returns no results', async () => {
    mockQuery.mockResolvedValue({ data: { btcVaultHistories: [] } } as never)

    const result = await getBtcVaultHistory({
      address: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
      limit: 20,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
    })

    expect(result).toEqual([])
  })

  it('preserves all fields from the subgraph response', async () => {
    mockQuery.mockResolvedValue({
      data: { btcVaultHistories: [mockHistoryItems[0]] },
    } as never)

    const result = await getBtcVaultHistory({
      address: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
      limit: 20,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
    })

    expect(result[0]).toEqual({
      id: '0xabc-1',
      user: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
      action: 'DEPOSIT_REQUEST',
      assets: '1000000000000000000',
      shares: '500000000000000000',
      epochId: '1',
      timestamp: 1710000000,
      blockNumber: '7136040',
      transactionHash: '0x78f9b9aaa',
    })
  })
})

describe('getBtcVaultHistoryCount', () => {
  it('returns counter.total when no type filter is provided', async () => {
    mockQuery.mockResolvedValue({
      data: { btcVaultHistoryCounter: mockCounter },
    } as never)

    const count = await getBtcVaultHistoryCount('0xa18f4fbee88592bee3d51d90ba791e769a9b902f')

    expect(count).toBe(10)
  })

  it('lowercases the address for the counter query', async () => {
    mockQuery.mockResolvedValue({
      data: { btcVaultHistoryCounter: mockCounter },
    } as never)

    await getBtcVaultHistoryCount('0xA18F4FBee88592Bee3D51D90Ba791E769a9B902F')

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { id: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f' },
        fetchPolicy: 'no-cache',
      }),
    )
  })

  it('returns 0 when counter entity does not exist', async () => {
    mockQuery.mockResolvedValue({
      data: { btcVaultHistoryCounter: null },
    } as never)

    const count = await getBtcVaultHistoryCount('0xa18f4fbee88592bee3d51d90ba791e769a9b902f')

    expect(count).toBe(0)
  })

  it('sums specific fields when type filter is applied', async () => {
    mockQuery.mockResolvedValue({
      data: { btcVaultHistoryCounter: mockCounter },
    } as never)

    const count = await getBtcVaultHistoryCount('0xa18f4fbee88592bee3d51d90ba791e769a9b902f', [
      'deposit_request',
      'deposit_claimed',
    ])

    // depositRequests (3) + depositsClaimed (2) = 5
    expect(count).toBe(5)
  })

  it('sums a single type filter correctly', async () => {
    mockQuery.mockResolvedValue({
      data: { btcVaultHistoryCounter: mockCounter },
    } as never)

    const count = await getBtcVaultHistoryCount('0xa18f4fbee88592bee3d51d90ba791e769a9b902f', [
      'redeem_request',
    ])

    expect(count).toBe(2)
  })

  it('returns 0 when counter is null and type filter is provided', async () => {
    mockQuery.mockResolvedValue({
      data: { btcVaultHistoryCounter: null },
    } as never)

    const count = await getBtcVaultHistoryCount('0xa18f4fbee88592bee3d51d90ba791e769a9b902f', [
      'deposit_request',
    ])

    expect(count).toBe(0)
  })

  it('returns total when type filter is empty array', async () => {
    mockQuery.mockResolvedValue({
      data: { btcVaultHistoryCounter: mockCounter },
    } as never)

    const count = await getBtcVaultHistoryCount('0xa18f4fbee88592bee3d51d90ba791e769a9b902f', [])

    expect(count).toBe(10)
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/components/ApolloClient', () => ({
  btcVaultClient: {
    query: vi.fn(),
  },
}))

vi.mock('@/app/api/btc-vault/v1/addresses/[address]/history/action', () => ({
  getBtcVaultHistoryCount: vi.fn(),
}))

import { btcVaultClient } from '@/shared/components/ApolloClient'
import { getBtcVaultHistoryCount, getGlobalBtcVaultHistory } from './action'

const mockQuery = vi.mocked(btcVaultClient.query)
const mockGetCount = vi.mocked(getBtcVaultHistoryCount)

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
    user: '0xb29f5fbee88592bee3d51d90ba791e769a9b903f',
    action: 'REDEEM_REQUEST',
    assets: '2000000000000000000',
    shares: '1000000000000000000',
    epochId: '2',
    timestamp: '1710100000',
    blockNumber: '7136080',
    transactionHash: '0x78f9b9bbb',
  },
]

beforeEach(() => {
  mockQuery.mockReset()
  mockGetCount.mockReset()
})

describe('getGlobalBtcVaultHistory', () => {
  it('uses global query when no address is provided', async () => {
    mockQuery.mockResolvedValue({ data: { btcVaultHistories: [] } } as never)

    await getGlobalBtcVaultHistory({
      limit: 20,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
    })

    const callArgs = mockQuery.mock.calls[0][0]
    expect(callArgs.variables).not.toHaveProperty('user')
    expect(callArgs.fetchPolicy).toBe('no-cache')
  })

  it('uses per-user query when address is provided', async () => {
    mockQuery.mockResolvedValue({ data: { btcVaultHistories: [] } } as never)

    await getGlobalBtcVaultHistory({
      limit: 20,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
      address: '0xA18F4FBee88592Bee3D51D90Ba791E769a9B902F',
    })

    const callArgs = mockQuery.mock.calls[0][0]
    expect(callArgs.variables).toHaveProperty('user', '0xa18f4fbee88592bee3d51d90ba791e769a9b902f')
  })

  it('computes skip from page and limit', async () => {
    mockQuery.mockResolvedValue({ data: { btcVaultHistories: [] } } as never)

    await getGlobalBtcVaultHistory({
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

    await getGlobalBtcVaultHistory({
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

    const result = await getGlobalBtcVaultHistory({
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

    const result = await getGlobalBtcVaultHistory({
      limit: 20,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
    })

    expect(result).toEqual([])
  })

  it('passes all action types when no type filter is provided', async () => {
    mockQuery.mockResolvedValue({ data: { btcVaultHistories: [] } } as never)

    await getGlobalBtcVaultHistory({
      limit: 20,
      page: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
    })

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          actionFilter: [
            'DEPOSIT_REQUEST',
            'DEPOSIT_CLAIMED',
            'DEPOSIT_CANCELLED',
            'REDEEM_REQUEST',
            'REDEEM_CLAIMED',
            'REDEEM_CANCELLED',
          ],
        }),
      }),
    )
  })
})

describe('getBtcVaultHistoryCount (re-export)', () => {
  it('is re-exported from address history action module', () => {
    expect(getBtcVaultHistoryCount).toBeDefined()
    expect(typeof getBtcVaultHistoryCount).toBe('function')
  })
})

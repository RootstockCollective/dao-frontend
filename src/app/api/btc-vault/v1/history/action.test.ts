import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/components/ApolloClient', () => ({
  btcVaultClient: {
    query: vi.fn(),
  },
}))

import { btcVaultClient } from '@/shared/components/ApolloClient'
import {
  enrichHistoryWithRequestStatus,
  getBtcVaultHistoryCount,
  getGlobalBtcVaultHistory,
} from './action'

const mockQuery = vi.mocked(btcVaultClient.query)

function gqlOperationName(query: unknown): string | undefined {
  return (query as { definitions?: { name?: { value?: string } }[] })?.definitions?.[0]?.name?.value
}

function mockDepositAndRedeemRequestQueries(payload: {
  deposits?: { id: string; status: string }[]
  redeems?: { id: string; status: string }[]
}) {
  const deposits = payload.deposits ?? []
  const redeems = payload.redeems ?? []
  mockQuery.mockImplementation((opts: { query: unknown }) => {
    const opName = gqlOperationName(opts.query)
    if (opName === 'BtcDepositRequestsByIds') {
      return Promise.resolve({ data: { btcDepositRequests: deposits } } as never)
    }
    if (opName === 'BtcRedeemRequestsByIds') {
      return Promise.resolve({ data: { btcRedeemRequests: redeems } } as never)
    }
    return Promise.reject(new Error('Unexpected query'))
  })
}

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

const mockCounter = {
  total: '10',
  depositRequests: '3',
  depositsClaimable: '1',
  depositsClaimed: '2',
  depositsCancelled: '1',
  redeemRequests: '2',
  redeemsClaimable: '1',
  redeemsClaimed: '1',
  redeemsCancelled: '1',
  redeemsAccepted: '0',
}

beforeEach(() => {
  mockQuery.mockReset()
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
            'DEPOSIT_CLAIMABLE',
            'DEPOSIT_CLAIMED',
            'DEPOSIT_CANCELLED',
            'REDEEM_REQUEST',
            'REDEEM_CLAIMABLE',
            'REDEEM_CLAIMED',
            'REDEEM_CANCELLED',
            'REDEEM_ACCEPTED',
          ],
        }),
      }),
    )
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

describe('enrichHistoryWithRequestStatus', () => {
  it('sets displayStatus successful for DEPOSIT_CLAIMED and REDEEM_CLAIMED without subgraph calls', async () => {
    const history = [
      {
        id: '0x1',
        user: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
        action: 'DEPOSIT_CLAIMED',
        assets: '100',
        shares: '50',
        epochId: '1',
        timestamp: 1710000000,
        blockNumber: '7136040',
        transactionHash: '0x78f9',
      },
      {
        id: '0x2',
        user: '0xb29f5fbee88592bee3d51d90ba791e769a9b903f',
        action: 'REDEEM_CLAIMED',
        assets: '200',
        shares: '100',
        epochId: '2',
        timestamp: 1710100000,
        blockNumber: '7136080',
        transactionHash: '0x78fa',
      },
    ]

    const result = await enrichHistoryWithRequestStatus(history)

    expect(mockQuery).not.toHaveBeenCalled()
    expect(result[0].displayStatus).toBe('successful')
    expect(result[1].displayStatus).toBe('successful')
  })

  it('sets displayStatus cancelled for DEPOSIT_CANCELLED and REDEEM_CANCELLED without subgraph calls', async () => {
    const history = [
      {
        id: '0x1',
        user: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
        action: 'DEPOSIT_CANCELLED',
        assets: '100',
        shares: '50',
        epochId: '1',
        timestamp: 1710000000,
        blockNumber: '7136040',
        transactionHash: '0x78f9',
      },
      {
        id: '0x2',
        user: '0xb29f5fbee88592bee3d51d90ba791e769a9b903f',
        action: 'REDEEM_CANCELLED',
        assets: '200',
        shares: '100',
        epochId: '2',
        timestamp: 1710100000,
        blockNumber: '7136080',
        transactionHash: '0x78fa',
      },
    ]

    const result = await enrichHistoryWithRequestStatus(history)

    expect(mockQuery).not.toHaveBeenCalled()
    expect(result[0].displayStatus).toBe('cancelled')
    expect(result[1].displayStatus).toBe('cancelled')
  })

  it('sets open_to_claim for DEPOSIT_REQUEST when request status is CLAIMABLE', async () => {
    const history = [
      {
        id: '0x1',
        user: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
        action: 'DEPOSIT_REQUEST',
        assets: '100',
        shares: '50',
        epochId: '1',
        timestamp: 1710000000,
        blockNumber: '7136040',
        transactionHash: '0x78f9',
      },
    ]
    const requestId = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f-1'
    mockDepositAndRedeemRequestQueries({
      deposits: [{ id: requestId, status: 'CLAIMABLE' }],
    })

    const result = await enrichHistoryWithRequestStatus(history)

    expect(result[0].displayStatus).toBe('open_to_claim')
  })

  it('sets approved for REDEEM_REQUEST when subgraph status is ACCEPTED', async () => {
    const history = [
      {
        id: '0x2',
        user: '0xb29f5fbee88592bee3d51d90ba791e769a9b903f',
        action: 'REDEEM_REQUEST',
        assets: '200',
        shares: '100',
        epochId: '2',
        timestamp: 1710100000,
        blockNumber: '7136080',
        transactionHash: '0x78fa',
      },
    ]
    const requestId = '0xb29f5fbee88592bee3d51d90ba791e769a9b903f-2'
    mockDepositAndRedeemRequestQueries({
      redeems: [{ id: requestId, status: 'ACCEPTED' }],
    })

    const result = await enrichHistoryWithRequestStatus(history)

    expect(result[0].displayStatus).toBe('approved')
  })

  it('normalizes redeem ACCEPTED casing to wire approved', async () => {
    const history = [
      {
        id: '0x2',
        user: '0xb29f5fbee88592bee3d51d90ba791e769a9b903f',
        action: 'REDEEM_REQUEST',
        assets: '200',
        shares: '100',
        epochId: '2',
        timestamp: 1710100000,
        blockNumber: '7136080',
        transactionHash: '0x78fa',
      },
    ]
    const requestId = '0xb29f5fbee88592bee3d51d90ba791e769a9b903f-2'
    mockDepositAndRedeemRequestQueries({
      redeems: [{ id: requestId, status: 'Accepted' }],
    })

    const result = await enrichHistoryWithRequestStatus(history)

    expect(result[0].displayStatus).toBe('approved')
  })

  it('sets successful for REDEEM_REQUEST when subgraph status is CLAIMED', async () => {
    const history = [
      {
        id: '0x2',
        user: '0xb29f5fbee88592bee3d51d90ba791e769a9b903f',
        action: 'REDEEM_REQUEST',
        assets: '200',
        shares: '100',
        epochId: '2',
        timestamp: 1710100000,
        blockNumber: '7136080',
        transactionHash: '0x78fa',
      },
    ]
    const requestId = '0xb29f5fbee88592bee3d51d90ba791e769a9b903f-2'
    mockDepositAndRedeemRequestQueries({
      redeems: [{ id: requestId, status: 'CLAIMED' }],
    })

    const result = await enrichHistoryWithRequestStatus(history)

    expect(result[0].displayStatus).toBe('successful')
  })

  it('sets claim_pending for REDEEM_REQUEST when request status is CLAIMABLE', async () => {
    const history = [
      {
        id: '0x2',
        user: '0xb29f5fbee88592bee3d51d90ba791e769a9b903f',
        action: 'REDEEM_REQUEST',
        assets: '200',
        shares: '100',
        epochId: '2',
        timestamp: 1710100000,
        blockNumber: '7136080',
        transactionHash: '0x78fa',
      },
    ]
    const requestId = '0xb29f5fbee88592bee3d51d90ba791e769a9b903f-2'
    mockDepositAndRedeemRequestQueries({
      redeems: [{ id: requestId, status: 'CLAIMABLE' }],
    })

    const result = await enrichHistoryWithRequestStatus(history)

    expect(result[0].displayStatus).toBe('claim_pending')
  })

  it('sets pending for REQUEST when request status is PENDING', async () => {
    const history = [
      {
        id: '0x1',
        user: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
        action: 'DEPOSIT_REQUEST',
        assets: '100',
        shares: '50',
        epochId: '1',
        timestamp: 1710000000,
        blockNumber: '7136040',
        transactionHash: '0x78f9',
      },
    ]
    const requestId = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f-1'
    mockDepositAndRedeemRequestQueries({
      deposits: [{ id: requestId, status: 'PENDING' }],
    })

    const result = await enrichHistoryWithRequestStatus(history)

    expect(result[0].displayStatus).toBe('pending')
  })

  it('maps redeem subgraph status CANCELLED to wire cancelled', async () => {
    const history = [
      {
        id: '0x2',
        user: '0xb29f5fbee88592bee3d51d90ba791e769a9b903f',
        action: 'REDEEM_REQUEST',
        assets: '200',
        shares: '100',
        epochId: '2',
        timestamp: 1710100000,
        blockNumber: '7136080',
        transactionHash: '0x78fa',
      },
    ]
    const requestId = '0xb29f5fbee88592bee3d51d90ba791e769a9b903f-2'
    mockDepositAndRedeemRequestQueries({
      redeems: [{ id: requestId, status: 'cancelled' }],
    })

    const result = await enrichHistoryWithRequestStatus(history)

    expect(result[0].displayStatus).toBe('cancelled')
  })

  it('sets successful for DEPOSIT_REQUEST when subgraph status is CLAIMED', async () => {
    const history = [
      {
        id: '0x1',
        user: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
        action: 'DEPOSIT_REQUEST',
        assets: '100',
        shares: '50',
        epochId: '1',
        timestamp: 1710000000,
        blockNumber: '7136040',
        transactionHash: '0x78f9',
      },
    ]
    const requestId = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f-1'
    mockDepositAndRedeemRequestQueries({
      deposits: [{ id: requestId, status: 'CLAIMED' }],
    })

    const result = await enrichHistoryWithRequestStatus(history)

    expect(result[0].displayStatus).toBe('successful')
  })

  it('maps redeem unknown subgraph status to pending', async () => {
    const history = [
      {
        id: '0x2',
        user: '0xb29f5fbee88592bee3d51d90ba791e769a9b903f',
        action: 'REDEEM_REQUEST',
        assets: '200',
        shares: '100',
        epochId: '2',
        timestamp: 1710100000,
        blockNumber: '7136080',
        transactionHash: '0x78fa',
      },
    ]
    const requestId = '0xb29f5fbee88592bee3d51d90ba791e769a9b903f-2'
    mockDepositAndRedeemRequestQueries({
      redeems: [{ id: requestId, status: 'FUTURE_STATE' }],
    })

    const result = await enrichHistoryWithRequestStatus(history)

    expect(result[0].displayStatus).toBe('pending')
  })

  it('sets cancelled for REQUEST when request status is CANCELLED', async () => {
    const history = [
      {
        id: '0x2',
        user: '0xb29f5fbee88592bee3d51d90ba791e769a9b903f',
        action: 'REDEEM_REQUEST',
        assets: '200',
        shares: '100',
        epochId: '2',
        timestamp: 1710100000,
        blockNumber: '7136080',
        transactionHash: '0x78fa',
      },
    ]
    const requestId = '0xb29f5fbee88592bee3d51d90ba791e769a9b903f-2'
    mockDepositAndRedeemRequestQueries({
      redeems: [{ id: requestId, status: 'CANCELLED' }],
    })

    const result = await enrichHistoryWithRequestStatus(history)

    expect(result[0].displayStatus).toBe('cancelled')
  })

  it('defaults to pending when request id is not in subgraph result', async () => {
    const history = [
      {
        id: '0x1',
        user: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
        action: 'DEPOSIT_REQUEST',
        assets: '100',
        shares: '50',
        epochId: '99',
        timestamp: 1710000000,
        blockNumber: '7136040',
        transactionHash: '0x78f9',
      },
    ]
    mockDepositAndRedeemRequestQueries({})

    const result = await enrichHistoryWithRequestStatus(history)

    expect(result[0].displayStatus).toBe('pending')
  })

  it('normalizes user to lowercase when building request id', async () => {
    const history = [
      {
        id: '0x1',
        user: '0xA18F4FBee88592Bee3D51D90Ba791E769a9B902F',
        action: 'DEPOSIT_REQUEST',
        assets: '100',
        shares: '50',
        epochId: '1',
        timestamp: 1710000000,
        blockNumber: '7136040',
        transactionHash: '0x78f9',
      },
    ]
    const requestId = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f-1'
    mockDepositAndRedeemRequestQueries({
      deposits: [{ id: requestId, status: 'CLAIMABLE' }],
    })

    const result = await enrichHistoryWithRequestStatus(history)

    expect(result[0].displayStatus).toBe('open_to_claim')
  })
})

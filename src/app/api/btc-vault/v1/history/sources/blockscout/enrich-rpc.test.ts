import { beforeEach, describe, expect, it, vi } from 'vitest'

const { multicallMock, VAULT_FOR_TEST } = vi.hoisted(() => ({
  multicallMock: vi.fn(),
  VAULT_FOR_TEST: '0x2222222222222222222222222222222222222222',
}))

vi.mock('viem', async importOriginal => {
  const actual = await importOriginal<typeof import('viem')>()
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({
      multicall: multicallMock,
    })),
  }
})

vi.mock('@/lib/constants', async importOriginal => {
  const actual = await importOriginal<typeof import('@/lib/constants')>()
  return {
    ...actual,
    RBTC_VAULT_ADDRESS: VAULT_FOR_TEST as unknown as typeof actual.RBTC_VAULT_ADDRESS,
  }
})

import { enrichHistoryWithRpcRequestStatus } from './enrich-rpc'

describe('enrichHistoryWithRpcRequestStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_NODE_URL = 'https://rpc.test'
    process.env.NEXT_PUBLIC_CHAIN_ID = '31'
  })

  it('sets displayStatus from multicall for DEPOSIT_CLAIMABLE when claimable is zero', async () => {
    multicallMock.mockResolvedValueOnce([
      { status: 'success', result: 0n },
      { status: 'success', result: 0n },
    ])

    const out = await enrichHistoryWithRpcRequestStatus([
      {
        id: '1',
        user: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        action: 'DEPOSIT_CLAIMABLE',
        assets: '1',
        shares: '0',
        epochId: '1',
        timestamp: 1,
        blockNumber: '1',
        transactionHash: '0xabc',
      },
    ])

    expect(out[0]?.displayStatus).toBe('successful')
    expect(multicallMock).toHaveBeenCalledOnce()
  })

  it('sets displayStatus from multicall for DEPOSIT_CLAIMABLE when claimable is positive', async () => {
    multicallMock.mockResolvedValueOnce([
      { status: 'success', result: 0n },
      { status: 'success', result: 5n },
    ])

    const out = await enrichHistoryWithRpcRequestStatus([
      {
        id: '1',
        user: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        action: 'DEPOSIT_CLAIMABLE',
        assets: '1',
        shares: '0',
        epochId: '1',
        timestamp: 1,
        blockNumber: '1',
        transactionHash: '0xabc',
      },
    ])

    expect(out[0]?.displayStatus).toBe('open_to_claim')
  })

  it('sets displayStatus from multicall for REDEEM_CLAIMABLE', async () => {
    multicallMock.mockResolvedValueOnce([
      { status: 'success', result: 0n },
      { status: 'success', result: 2n },
    ])

    const out = await enrichHistoryWithRpcRequestStatus([
      {
        id: '1',
        user: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        action: 'REDEEM_CLAIMABLE',
        assets: '0',
        shares: '1',
        epochId: '1',
        timestamp: 1,
        blockNumber: '1',
        transactionHash: '0xabc',
      },
    ])

    expect(out[0]?.displayStatus).toBe('claim_pending')
  })

  it('uses mapActionToDisplayStatus for REDEEM_ACCEPTED without multicall', async () => {
    const out = await enrichHistoryWithRpcRequestStatus([
      {
        id: '1',
        user: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        action: 'REDEEM_ACCEPTED',
        assets: '0',
        shares: '1',
        epochId: '1',
        timestamp: 1,
        blockNumber: '1',
        transactionHash: '0xabc',
      },
    ])

    expect(out[0]?.displayStatus).toBe('approved')
    expect(multicallMock).not.toHaveBeenCalled()
  })
})

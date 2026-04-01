import { describe, it, expect, vi, beforeEach } from 'vitest'

import { fetchBlockscoutGetLogsPaginated } from '@/lib/blockscout/fetch-blockscout-get-logs-paginated'
import { STRIF_ADDRESS } from '@/lib/constants'
import type { BackendEventByTopic0ResponseValue } from '@/shared/utils'

import { fetchStakingHistoryFromBlockscout } from './fetch-from-blockscout'

vi.mock('@/lib/blockscout/fetch-blockscout-get-logs-paginated', () => ({
  fetchBlockscoutGetLogsPaginated: vi.fn(),
}))

const mockPaginated = vi.mocked(fetchBlockscoutGetLogsPaginated)

function sampleLog(overrides: Partial<BackendEventByTopic0ResponseValue> = {}): BackendEventByTopic0ResponseValue {
  return {
    address: '0xstrif',
    blockNumber: '0x1',
    data: '0x05',
    gasPrice: '0x1',
    gasUsed: '0x1',
    logIndex: '0x0',
    timeStamp: '0x3e8',
    topics: [null],
    transactionHash: '0xabc',
    transactionIndex: '0x0',
    ...overrides,
  }
}

describe('fetchStakingHistoryFromBlockscout', () => {
  const user = '0x0000000000000000000000000000000000000123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls shared Blockscout pagination for STAKE and UNSTAKE with correct topic layout', async () => {
    const padded = `0x${user.slice(2).toLowerCase().padStart(64, '0')}`
    const zero = '0x0000000000000000000000000000000000000000000000000000000000000000'

    mockPaginated.mockResolvedValue([])

    await fetchStakingHistoryFromBlockscout(user)

    expect(mockPaginated).toHaveBeenCalledTimes(2)

    const stakeCall = mockPaginated.mock.calls.find(
      ([args]) => args.query.topic2?.toLowerCase() === padded.toLowerCase(),
    )
    const unstakeCall = mockPaginated.mock.calls.find(
      ([args]) => args.query.topic1?.toLowerCase() === padded.toLowerCase(),
    )

    expect(stakeCall?.[0]).toMatchObject({
      query: {
        address: STRIF_ADDRESS,
        topic1: zero,
        topic2: padded,
        topic0_1_opr: 'and',
        topic0_2_opr: 'and',
        topic1_2_opr: 'and',
      },
      fetchInit: { next: { revalidate: 60 } },
    })

    expect(unstakeCall?.[0]).toMatchObject({
      query: {
        address: STRIF_ADDRESS,
        topic1: padded,
        topic2: zero,
      },
    })
  })

  it('maps logs to period groups and sorts by timestamp descending', async () => {
    mockPaginated
      .mockResolvedValueOnce([
        sampleLog({ timeStamp: '0x64', transactionHash: '0xaa', data: '0x01' }),
      ])
      .mockResolvedValueOnce([
        sampleLog({ timeStamp: '0xc8', transactionHash: '0xbb', data: '0x02' }),
      ])

    const groups = await fetchStakingHistoryFromBlockscout(user)

    expect(groups.length).toBeGreaterThan(0)
    const allTx = groups.flatMap(g => g.transactions)
    expect(allTx[0].transactionHash).toBe('0xbb')
    expect(allTx[allTx.length - 1].transactionHash).toBe('0xaa')
  })
})

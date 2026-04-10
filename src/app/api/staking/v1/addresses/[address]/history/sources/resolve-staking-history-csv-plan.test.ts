import { beforeEach, describe, expect, it, vi } from 'vitest'
import { logger } from '@/lib/logger'

import { resolveStakingHistoryCsvPlan, stakingHistoryCsvSourceHeaders } from './resolve-staking-history-csv-plan'

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}))

vi.mock('./database/fetch-from-database', () => ({
  getStakingHistoryFromDB: vi.fn(),
  getStakingHistoryCountFromDB: vi.fn(),
}))

vi.mock('./blockscout/fetch-from-blockscout', () => ({
  fetchStakingHistoryFromBlockscout: vi.fn(),
}))

import { fetchStakingHistoryFromBlockscout } from './blockscout/fetch-from-blockscout'
import { getStakingHistoryCountFromDB, getStakingHistoryFromDB } from './database/fetch-from-database'
import type { StakingHistoryByPeriodAndAction } from '../types'

const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'

const sortParams = {
  sort_field: 'period' as const,
  sort_direction: 'desc' as const,
}

const mockGroups: StakingHistoryByPeriodAndAction[] = [
  {
    period: '2025-11',
    action: 'STAKE',
    amount: '1',
    transactions: [
      {
        user: address,
        action: 'STAKE',
        amount: '1',
        blockNumber: '1',
        blockHash: null,
        timestamp: 1000,
        transactionHash: '0x1',
      },
    ],
  },
]

const mockGetStakingHistoryFromDB = vi.mocked(getStakingHistoryFromDB)
const mockGetStakingHistoryCountFromDB = vi.mocked(getStakingHistoryCountFromDB)
const mockFetchStakingHistoryFromBlockscout = vi.mocked(fetchStakingHistoryFromBlockscout)

beforeEach(() => {
  mockGetStakingHistoryFromDB.mockReset()
  mockGetStakingHistoryCountFromDB.mockReset()
  mockFetchStakingHistoryFromBlockscout.mockReset()
  vi.mocked(logger.error).mockClear()
})

describe('resolveStakingHistoryCsvPlan', () => {
  it('returns database plan when DB succeeds', async () => {
    mockGetStakingHistoryFromDB.mockResolvedValue(mockGroups)
    mockGetStakingHistoryCountFromDB.mockResolvedValue(1)

    const plan = await resolveStakingHistoryCsvPlan(address, sortParams, 200)

    expect(plan.kind).toBe('database')
    if (plan.kind === 'database') {
      expect(plan.firstBatch).toEqual(mockGroups)
      expect(plan.totalCount).toBe(1)
      expect(plan.pageSize).toBe(200)
    }
    expect(mockFetchStakingHistoryFromBlockscout).not.toHaveBeenCalled()
  })

  it('returns blockscout plan when DB throws', async () => {
    mockGetStakingHistoryFromDB.mockRejectedValue(new Error('db down'))
    mockFetchStakingHistoryFromBlockscout.mockResolvedValue(mockGroups)

    const plan = await resolveStakingHistoryCsvPlan(address, sortParams, 200)

    expect(plan.kind).toBe('blockscout')
    if (plan.kind === 'blockscout') {
      expect(plan.groups).toEqual(mockGroups)
    }
  })

  it('throws when count fails after first page succeeds', async () => {
    mockGetStakingHistoryFromDB.mockResolvedValue(mockGroups)
    mockGetStakingHistoryCountFromDB.mockRejectedValue(new Error('count failed'))
    mockFetchStakingHistoryFromBlockscout.mockResolvedValue(mockGroups)

    const plan = await resolveStakingHistoryCsvPlan(address, sortParams, 200)

    expect(plan.kind).toBe('blockscout')
  })

  it('throws ALL_STAKING_HISTORY_SOURCES_FAILED when both fail', async () => {
    mockGetStakingHistoryFromDB.mockRejectedValue(new Error('db down'))
    mockFetchStakingHistoryFromBlockscout.mockRejectedValue(new Error('explorer down'))

    await expect(resolveStakingHistoryCsvPlan(address, sortParams, 200)).rejects.toMatchObject({
      name: 'ALL_STAKING_HISTORY_SOURCES_FAILED',
    })

    expect(vi.mocked(logger.error)).toHaveBeenCalledTimes(2)
    expect(vi.mocked(logger.error).mock.calls[0][0]).toMatchObject({ sourceName: 'database' })
    expect(vi.mocked(logger.error).mock.calls[1][0]).toMatchObject({ sourceName: 'blockscout' })
  })
})

describe('stakingHistoryCsvSourceHeaders', () => {
  it('maps plan kind to headers', () => {
    expect(
      stakingHistoryCsvSourceHeaders({
        kind: 'database',
        firstBatch: [],
        totalCount: 0,
        pageSize: 200,
        address,
        sortParams,
      }),
    ).toEqual({ 'X-Source': 'source-0', 'x-source-name': 'database' })

    expect(
      stakingHistoryCsvSourceHeaders({
        kind: 'blockscout',
        groups: [],
      }),
    ).toEqual({ 'X-Source': 'source-1', 'x-source-name': 'blockscout' })
  })
})

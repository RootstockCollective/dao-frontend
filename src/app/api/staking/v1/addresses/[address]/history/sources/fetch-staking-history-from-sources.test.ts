import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchStakingHistoryFromSources } from './fetch-staking-history-from-sources'

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

const mockRow: StakingHistoryByPeriodAndAction[] = [
  {
    period: '2025-12',
    action: 'STAKE',
    amount: '1',
    transactions: [],
  },
]

const baseParams = {
  address,
  limit: 20,
  offset: 0,
  sort_field: 'period' as const,
  sort_direction: 'desc' as const,
}

const mockGetStakingHistoryFromDB = vi.mocked(getStakingHistoryFromDB)
const mockGetStakingHistoryCountFromDB = vi.mocked(getStakingHistoryCountFromDB)
const mockFetchStakingHistoryFromBlockscout = vi.mocked(fetchStakingHistoryFromBlockscout)

beforeEach(() => {
  mockGetStakingHistoryFromDB.mockReset()
  mockGetStakingHistoryCountFromDB.mockReset()
  mockFetchStakingHistoryFromBlockscout.mockReset()
})

describe('fetchStakingHistoryFromSources', () => {
  it('returns database result on first success including empty data', async () => {
    mockGetStakingHistoryFromDB.mockResolvedValue([])
    mockGetStakingHistoryCountFromDB.mockResolvedValue(0)

    const out = await fetchStakingHistoryFromSources(baseParams)

    expect(out.sourceName).toBe('database')
    expect(out.sourceIndex).toBe(0)
    expect(out.data).toEqual([])
    expect(out.total).toBe(0)
    expect(mockFetchStakingHistoryFromBlockscout).not.toHaveBeenCalled()
  })

  it('tries blockscout when database throws', async () => {
    mockGetStakingHistoryFromDB.mockRejectedValue(new Error('db down'))
    mockFetchStakingHistoryFromBlockscout.mockResolvedValue(mockRow)

    const out = await fetchStakingHistoryFromSources(baseParams)

    expect(out.sourceName).toBe('blockscout')
    expect(out.sourceIndex).toBe(1)
    expect(out.data).toEqual(mockRow)
    expect(mockFetchStakingHistoryFromBlockscout).toHaveBeenCalledWith(address)
  })

  it('throws when every source fails', async () => {
    mockGetStakingHistoryFromDB.mockRejectedValue(new Error('db down'))
    mockFetchStakingHistoryFromBlockscout.mockRejectedValue(new Error('explorer down'))

    await expect(fetchStakingHistoryFromSources(baseParams)).rejects.toMatchObject({
      name: 'ALL_STAKING_HISTORY_SOURCES_FAILED',
      message: 'Can not fetch staking history from any source',
    })
  })
})

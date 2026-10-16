import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

vi.mock('@/app/user/Balances/actions', () => ({
  fetchPrices: vi.fn(),
}))

vi.mock('../action', () => ({
  getStakingHistoryFromDB: vi.fn(),
}))

vi.mock('../sources/resolve-staking-history-csv-plan', async importOriginal => {
  const actual = await importOriginal<typeof import('../sources/resolve-staking-history-csv-plan')>()
  return {
    ...actual,
    resolveStakingHistoryCsvPlan: vi.fn(),
  }
})

import { fetchPrices } from '@/app/user/Balances/actions'
import { getStakingHistoryFromDB } from '../action'
import { resolveStakingHistoryCsvPlan } from '../sources/resolve-staking-history-csv-plan'
import { RIF } from '@/lib/constants'
import type { StakingHistoryByPeriodAndAction } from '../types'

const mockFetchPrices = vi.mocked(fetchPrices)
const mockResolvePlan = vi.mocked(resolveStakingHistoryCsvPlan)
const mockGetStakingHistoryFromDB = vi.mocked(getStakingHistoryFromDB)

const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'

const mockGroups: StakingHistoryByPeriodAndAction[] = [
  {
    period: '2025-11',
    action: 'STAKE',
    amount: '1000000000000000000',
    transactions: [
      {
        user: address,
        action: 'STAKE',
        amount: '1000000000000000000',
        blockNumber: '1',
        blockHash: null,
        timestamp: 1765816647,
        transactionHash: '0xabc',
      },
    ],
  },
]

beforeEach(() => {
  mockFetchPrices.mockResolvedValue({ [RIF]: { price: 0.05 } } as never)
  mockResolvePlan.mockReset()
  mockGetStakingHistoryFromDB.mockReset()
})

describe('GET /api/staking/v1/addresses/[address]/history/csv', () => {
  it('returns 400 for invalid address', async () => {
    const res = await GET(new Request('http://localhost/csv') as never, {
      params: Promise.resolve({ address: 'not-an-address' }),
    })
    expect(res.status).toBe(400)
  })

  it('streams CSV from blockscout plan with source headers', async () => {
    mockResolvePlan.mockResolvedValue({ kind: 'blockscout', groups: mockGroups })

    const res = await GET(new Request(`http://localhost/csv`) as never, {
      params: Promise.resolve({ address }),
    })

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/csv')
    expect(res.headers.get('x-source-name')).toBe('blockscout')
    expect(res.headers.get('X-Source')).toBe('source-1')

    const text = await res.text()
    expect(text).toContain('Period')
    expect(text).toContain('0xabc')
  })

  it('ends the CSV with a generic error line when a later database batch fails', async () => {
    mockResolvePlan.mockResolvedValue({
      kind: 'database',
      firstBatch: mockGroups,
      totalCount: 2,
      pageSize: 1,
      address,
      sortParams: { sort_field: 'period', sort_direction: 'desc' },
    })
    mockGetStakingHistoryFromDB.mockRejectedValue(
      new Error('select * from "StakingHistory" - Connection terminated'),
    )

    const res = await GET(new Request(`http://localhost/csv`) as never, {
      params: Promise.resolve({ address }),
    })

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let text = ''
    await expect(
      (async () => {
        for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
          text += decoder.decode(chunk.value)
        }
      })(),
    ).rejects.toThrow()

    expect(text).toContain('0xabc')
    expect(text).toMatch(/\nERROR: Internal server error \([0-9a-f-]{36}\)$/)
    expect(text).not.toContain('StakingHistory')
  })

  it('returns 500 when plan resolution fails', async () => {
    const err = new Error('Can not fetch staking history from any source')
    err.name = 'ALL_STAKING_HISTORY_SOURCES_FAILED'
    mockResolvePlan.mockRejectedValue(err)

    const res = await GET(new Request(`http://localhost/csv`) as never, {
      params: Promise.resolve({ address }),
    })

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({
      success: false,
      error: 'Internal server error',
      errorId: expect.any(String),
    })
  })
})

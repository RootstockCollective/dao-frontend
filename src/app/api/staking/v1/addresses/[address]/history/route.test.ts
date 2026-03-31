import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

vi.mock('./sources/database/fetchFromDatabase', () => ({
  getStakingHistoryFromDB: vi.fn(),
  getStakingHistoryCountFromDB: vi.fn(),
}))

vi.mock('./sources/blockscout/fetchFromBlockscout', () => ({
  fetchStakingHistoryFromBlockscout: vi.fn(),
}))

import { fetchStakingHistoryFromBlockscout } from './sources/blockscout/fetchFromBlockscout'
import { getStakingHistoryCountFromDB, getStakingHistoryFromDB } from './sources/database/fetchFromDatabase'
import type { StakingHistoryByPeriodAndAction } from './types'

const mockGetStakingHistoryFromDB = vi.mocked(getStakingHistoryFromDB)
const mockGetStakingHistoryCountFromDB = vi.mocked(getStakingHistoryCountFromDB)
const mockFetchStakingHistoryFromBlockscout = vi.mocked(fetchStakingHistoryFromBlockscout)

const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'

const mockRow: StakingHistoryByPeriodAndAction[] = [
  {
    period: '2025-12',
    action: 'STAKE',
    amount: '1000000000000000000',
    transactions: [
      {
        user: address,
        action: 'STAKE',
        amount: '1000000000000000000',
        blockNumber: '100',
        blockHash: null,
        timestamp: 1765816647,
        transactionHash: '0xabc',
      },
    ],
  },
]

beforeEach(() => {
  mockGetStakingHistoryFromDB.mockReset()
  mockGetStakingHistoryCountFromDB.mockReset()
  mockFetchStakingHistoryFromBlockscout.mockReset()
})

describe('GET /api/staking/v1/addresses/[address]/history', () => {
  it('returns 400 for invalid address', async () => {
    const req = new Request(`http://localhost/api/staking/v1/addresses/not-an-address/history`)
    const res = await GET(req as never, { params: Promise.resolve({ address: 'not-an-address' }) })
    expect(res.status).toBe(400)
  })

  it('returns DB data with X-Source and x-source-name when DB succeeds', async () => {
    mockGetStakingHistoryFromDB.mockResolvedValue(mockRow)
    mockGetStakingHistoryCountFromDB.mockResolvedValue(1)

    const req = new Request(`http://localhost/api/staking/v1/addresses/${address}/history`)
    const res = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(res.status).toBe(200)
    expect(res.headers.get('X-Source')).toBe('source-0')
    expect(res.headers.get('x-source-name')).toBe('database')
    const body = await res.json()
    expect(body.data).toEqual(mockRow)
    expect(body.pagination.total).toBe(1)
    expect(mockFetchStakingHistoryFromBlockscout).not.toHaveBeenCalled()
  })

  it('does not call Blockscout when DB returns empty history', async () => {
    mockGetStakingHistoryFromDB.mockResolvedValue([])
    mockGetStakingHistoryCountFromDB.mockResolvedValue(0)

    const req = new Request(`http://localhost/api/staking/v1/addresses/${address}/history`)
    const res = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(res.status).toBe(200)
    expect(mockFetchStakingHistoryFromBlockscout).not.toHaveBeenCalled()
    const body = await res.json()
    expect(body.data).toEqual([])
  })

  it('falls back to Blockscout with headers when DB throws', async () => {
    mockGetStakingHistoryFromDB.mockRejectedValue(new Error('connection refused'))
    mockFetchStakingHistoryFromBlockscout.mockResolvedValue(mockRow)

    const req = new Request(`http://localhost/api/staking/v1/addresses/${address}/history?limit=10&offset=0`)
    const res = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(res.status).toBe(200)
    expect(res.headers.get('X-Source')).toBe('source-1')
    expect(res.headers.get('x-source-name')).toBe('blockscout')
    expect(mockFetchStakingHistoryFromBlockscout).toHaveBeenCalledWith(address)
    const body = await res.json()
    expect(body.data).toEqual(mockRow)
    expect(body.pagination.total).toBe(1)
  })

  it('falls back when count query throws after history succeeded', async () => {
    mockGetStakingHistoryFromDB.mockResolvedValue(mockRow)
    mockGetStakingHistoryCountFromDB.mockRejectedValue(new Error('timeout'))
    mockFetchStakingHistoryFromBlockscout.mockResolvedValue(mockRow)

    const req = new Request(`http://localhost/api/staking/v1/addresses/${address}/history`)
    const res = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(res.status).toBe(200)
    expect(res.headers.get('X-Source')).toBe('source-1')
    expect(res.headers.get('x-source-name')).toBe('blockscout')
    expect(mockFetchStakingHistoryFromBlockscout).toHaveBeenCalled()
  })

  it('returns 500 when all sources fail', async () => {
    mockGetStakingHistoryFromDB.mockRejectedValue(new Error('db down'))
    mockFetchStakingHistoryFromBlockscout.mockRejectedValue(new Error('explorer down'))

    const req = new Request(`http://localhost/api/staking/v1/addresses/${address}/history`)
    const res = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.message).toContain('Can not fetch staking history from any source')
  })
})

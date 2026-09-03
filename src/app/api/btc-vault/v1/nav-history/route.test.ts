import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'
import type { BtcVaultNavHistoryItem } from './types'

vi.mock('./action', () => ({
  fetchBtcVaultNavHistoryPage: vi.fn(),
}))

import { fetchBtcVaultNavHistoryPage } from './action'

const mockPaged = vi.mocked(fetchBtcVaultNavHistoryPage)

const row = (
  overrides: Partial<BtcVaultNavHistoryItem> & Pick<
    BtcVaultNavHistoryItem,
    'id' | 'processedAt' | 'requestsProcessedInEpoch'
  >,
): BtcVaultNavHistoryItem => ({
  epochId: 1,
  reportedOffchainAssets: '0',
  blockNumber: 1,
  transactionHash: '0xh',
  deposits: [],
  redeems: [],
  ...overrides,
})

describe('GET /api/btc-vault/v1/nav-history', () => {
  beforeEach(() => {
    mockPaged.mockReset()
  })

  it('with no query uses fetchBtcVaultNavHistoryPage with schema defaults', async () => {
    mockPaged.mockResolvedValue({
      data: [
        row({ id: 'a', processedAt: 300, requestsProcessedInEpoch: 1 }),
        row({ id: 'b', processedAt: 100, requestsProcessedInEpoch: 1 }),
      ],
      total: 2,
    })

    const req = new NextRequest('http://localhost/api/btc-vault/v1/nav-history')
    const res = await GET(req)

    expect(mockPaged).toHaveBeenCalledTimes(1)
    expect(mockPaged).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      sort_field: 'processedAt',
      sort_direction: 'desc',
    })

    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      data: BtcVaultNavHistoryItem[]
      pagination: { sort_field: string; sort_direction: string }
    }
    expect(body.data.map(r => r.id)).toEqual(['a', 'b'])
    expect(body.pagination.sort_direction).toBe('desc')
  })

  it('uses fetchBtcVaultNavHistoryPage with validated query params', async () => {
    mockPaged.mockResolvedValue({
      data: [row({ id: 'lo', processedAt: 111, requestsProcessedInEpoch: 1 })],
      total: 2,
    })

    const url =
      'http://localhost/api/btc-vault/v1/nav-history?page=1&limit=1&sort_field=processedAt&sort_direction=asc'
    const req = new NextRequest(url)
    const res = await GET(req)

    expect(mockPaged).toHaveBeenCalledWith({
      page: 1,
      limit: 1,
      sort_field: 'processedAt',
      sort_direction: 'asc',
    })

    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      data: BtcVaultNavHistoryItem[]
      pagination: {
        sort_field: string
        sort_direction: string
        page: number
        limit: number
        offset: number
        total: number
        totalPages: number
      }
    }

    expect(body.data).toHaveLength(1)
    expect(body.data[0].id).toBe('lo')
    expect(body.pagination).toMatchObject({
      page: 1,
      limit: 1,
      offset: 0,
      total: 2,
      totalPages: 2,
      sort_field: 'processedAt',
      sort_direction: 'asc',
    })
  })

  it('uses sort_field=requestsProcessedInEpoch for paged fetch', async () => {
    mockPaged.mockResolvedValue({
      data: [
        row({ id: 'light', processedAt: 500, requestsProcessedInEpoch: 2 }),
        row({ id: 'heavy', processedAt: 400, requestsProcessedInEpoch: 10 }),
      ],
      total: 2,
    })

    const url =
      'http://localhost/api/btc-vault/v1/nav-history?page=1&limit=10&sort_field=requestsProcessedInEpoch&sort_direction=asc'
    const req = new NextRequest(url)
    const res = await GET(req)

    expect(mockPaged).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      sort_field: 'requestsProcessedInEpoch',
      sort_direction: 'asc',
    })

    expect(res.status).toBe(200)
    const body = (await res.json()) as { data: BtcVaultNavHistoryItem[]; pagination: { sort_field: string } }
    expect(body.data.map(r => r.id)).toEqual(['light', 'heavy'])
    expect(body.pagination.sort_field).toBe('requestsProcessedInEpoch')
  })

  it('returns 400 on invalid params', async () => {
    const url = 'http://localhost/api/btc-vault/v1/nav-history?page=none'
    const req = new NextRequest(url)
    const res = await GET(req)

    expect(mockPaged).not.toHaveBeenCalled()

    expect(res.status).toBe(400)
  })
})

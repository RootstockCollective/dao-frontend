import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

vi.mock('@/app/api/btc-vault/v1/addresses/[address]/history/action', () => ({
  getBtcVaultHistory: vi.fn(),
  getBtcVaultHistoryCount: vi.fn(),
}))

import { getBtcVaultHistory, getBtcVaultHistoryCount, type BtcVaultHistoryItem } from './action'

const mockGetBtcVaultHistory = vi.mocked(getBtcVaultHistory)
const mockGetBtcVaultHistoryCount = vi.mocked(getBtcVaultHistoryCount)

const mockHistory: BtcVaultHistoryItem[] = [
  {
    id: '0xabc-1',
    user: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
    action: 'DEPOSIT_REQUEST',
    assets: '1000000000000000000',
    shares: '500000000000000000',
    epochId: '1',
    timestamp: 1710000000,
    blockNumber: '7136040',
    transactionHash: '0x78f9b9aaa',
  },
]

beforeEach(() => {
  mockGetBtcVaultHistory.mockReset()
  mockGetBtcVaultHistoryCount.mockReset()
})

describe('GET /api/btc-vault/v1/addresses/[address]/history', () => {
  it('should return 200 with correct data and pagination shape', async () => {
    mockGetBtcVaultHistory.mockResolvedValue(mockHistory)
    mockGetBtcVaultHistoryCount.mockResolvedValue(1)

    const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'
    const req = new Request(`http://localhost/api/btc-vault/v1/addresses/${address}/history`)
    const response = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.data).toEqual(mockHistory)
    expect(body.pagination).toEqual({
      page: 1,
      limit: 20,
      offset: 0,
      total: 1,
      totalPages: 1,
      sort_field: 'timestamp',
      sort_direction: 'desc',
    })
  })

  it('should return 400 for invalid address format', async () => {
    const req = new Request('http://localhost/api/btc-vault/v1/addresses/invalid-address/history')
    const response = await GET(req as never, {
      params: Promise.resolve({ address: 'invalid-address' }),
    })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Validation failed')
  })

  it('should return 400 for empty address (0x)', async () => {
    const req = new Request('http://localhost/api/btc-vault/v1/addresses/0x/history')
    const response = await GET(req as never, { params: Promise.resolve({ address: '0x' }) })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Validation failed')
  })

  it('should return 400 for invalid sort_field value', async () => {
    const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'
    const req = new Request(
      `http://localhost/api/btc-vault/v1/addresses/${address}/history?sort_field=invalid`,
    )
    const response = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Validation failed')
  })

  it('should return 400 for limit exceeding max', async () => {
    const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'
    const req = new Request(
      `http://localhost/api/btc-vault/v1/addresses/${address}/history?limit=999`,
    )
    const response = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Validation failed')
  })

  it('should return 400 for invalid action type', async () => {
    const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'
    const req = new Request(
      `http://localhost/api/btc-vault/v1/addresses/${address}/history?type=invalid_type`,
    )
    const response = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Validation failed')
  })

  it('should pass query parameters to action functions', async () => {
    mockGetBtcVaultHistory.mockResolvedValue([])
    mockGetBtcVaultHistoryCount.mockResolvedValue(0)

    const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'
    const req = new Request(
      `http://localhost/api/btc-vault/v1/addresses/${address}/history?page=2&limit=10&sort_field=assets&sort_direction=asc&type=deposit_request`,
    )
    const response = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(response.status).toBe(200)
    expect(mockGetBtcVaultHistory).toHaveBeenCalledWith({
      address,
      limit: 10,
      page: 2,
      sort_field: 'assets',
      sort_direction: 'asc',
      type: ['deposit_request'],
    })
    expect(mockGetBtcVaultHistoryCount).toHaveBeenCalledWith(address, ['deposit_request'])
  })

  it('should handle multiple type query params', async () => {
    mockGetBtcVaultHistory.mockResolvedValue([])
    mockGetBtcVaultHistoryCount.mockResolvedValue(0)

    const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'
    const req = new Request(
      `http://localhost/api/btc-vault/v1/addresses/${address}/history?type=deposit_request&type=redeem_claimed`,
    )
    const response = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(response.status).toBe(200)
    expect(mockGetBtcVaultHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ['deposit_request', 'redeem_claimed'],
      }),
    )
  })

  it('should return 200 with empty data when no results', async () => {
    mockGetBtcVaultHistory.mockResolvedValue([])
    mockGetBtcVaultHistoryCount.mockResolvedValue(0)

    const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'
    const req = new Request(`http://localhost/api/btc-vault/v1/addresses/${address}/history`)
    const response = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toEqual([])
    expect(body.pagination.total).toBe(0)
    expect(body.pagination.totalPages).toBe(0)
  })

  it('should compute pagination correctly for multiple pages', async () => {
    mockGetBtcVaultHistory.mockResolvedValue(mockHistory)
    mockGetBtcVaultHistoryCount.mockResolvedValue(45)

    const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'
    const req = new Request(
      `http://localhost/api/btc-vault/v1/addresses/${address}/history?page=3&limit=10`,
    )
    const response = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.pagination).toEqual({
      page: 3,
      limit: 10,
      offset: 20,
      total: 45,
      totalPages: 5,
      sort_field: 'timestamp',
      sort_direction: 'desc',
    })
  })
})

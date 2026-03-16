import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

vi.mock('@/app/api/btc-vault/v1/history/action', () => ({
  getGlobalBtcVaultHistory: vi.fn(),
  getBtcVaultHistoryCount: vi.fn(),
}))

import { getBtcVaultHistoryCount, getGlobalBtcVaultHistory, type BtcVaultHistoryItem } from './action'

const mockGetHistory = vi.mocked(getGlobalBtcVaultHistory)
const mockGetCount = vi.mocked(getBtcVaultHistoryCount)

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
  mockGetHistory.mockReset()
  mockGetCount.mockReset()
})

describe('GET /api/btc-vault/v1/history', () => {
  it('should return 200 with correct data and pagination shape (no address)', async () => {
    mockGetHistory.mockResolvedValue(mockHistory)
    mockGetCount.mockResolvedValue(1)

    const req = new Request('http://localhost/api/btc-vault/v1/history')
    const response = await GET(req as never)

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

  it('should call counter with "global" when no address provided', async () => {
    mockGetHistory.mockResolvedValue([])
    mockGetCount.mockResolvedValue(0)

    const req = new Request('http://localhost/api/btc-vault/v1/history')
    await GET(req as never)

    expect(mockGetCount).toHaveBeenCalledWith('global', undefined)
  })

  it('should pass address to action functions when provided', async () => {
    mockGetHistory.mockResolvedValue([])
    mockGetCount.mockResolvedValue(0)

    const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'
    const req = new Request(`http://localhost/api/btc-vault/v1/history?address=${address}`)
    const response = await GET(req as never)

    expect(response.status).toBe(200)
    expect(mockGetHistory).toHaveBeenCalledWith(
      expect.objectContaining({ address }),
    )
    expect(mockGetCount).toHaveBeenCalledWith(address, undefined)
  })

  it('should return 400 for invalid address query param', async () => {
    const req = new Request('http://localhost/api/btc-vault/v1/history?address=not-an-address')
    const response = await GET(req as never)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Validation failed')
  })

  it('should return 400 for invalid sort_field value', async () => {
    const req = new Request('http://localhost/api/btc-vault/v1/history?sort_field=invalid')
    const response = await GET(req as never)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Validation failed')
  })

  it('should return 400 for limit exceeding max', async () => {
    const req = new Request('http://localhost/api/btc-vault/v1/history?limit=999')
    const response = await GET(req as never)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Validation failed')
  })

  it('should return 400 for invalid action type', async () => {
    const req = new Request('http://localhost/api/btc-vault/v1/history?type=invalid_type')
    const response = await GET(req as never)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Validation failed')
  })

  it('should pass type filter through correctly', async () => {
    mockGetHistory.mockResolvedValue([])
    mockGetCount.mockResolvedValue(0)

    const req = new Request(
      'http://localhost/api/btc-vault/v1/history?type=deposit_request&type=redeem_claimed',
    )
    const response = await GET(req as never)

    expect(response.status).toBe(200)
    expect(mockGetHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ['deposit_request', 'redeem_claimed'],
      }),
    )
    expect(mockGetCount).toHaveBeenCalledWith('global', ['deposit_request', 'redeem_claimed'])
  })

  it('should return 200 with empty data when no results', async () => {
    mockGetHistory.mockResolvedValue([])
    mockGetCount.mockResolvedValue(0)

    const req = new Request('http://localhost/api/btc-vault/v1/history')
    const response = await GET(req as never)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toEqual([])
    expect(body.pagination.total).toBe(0)
    expect(body.pagination.totalPages).toBe(0)
  })

  it('should pass query parameters correctly', async () => {
    mockGetHistory.mockResolvedValue([])
    mockGetCount.mockResolvedValue(0)

    const req = new Request(
      'http://localhost/api/btc-vault/v1/history?page=2&limit=10&sort_field=assets&sort_direction=asc',
    )
    const response = await GET(req as never)

    expect(response.status).toBe(200)
    expect(mockGetHistory).toHaveBeenCalledWith({
      limit: 10,
      page: 2,
      sort_field: 'assets',
      sort_direction: 'asc',
      type: undefined,
      address: undefined,
    })
  })

  it('should compute pagination correctly for multiple pages', async () => {
    mockGetHistory.mockResolvedValue(mockHistory)
    mockGetCount.mockResolvedValue(45)

    const req = new Request('http://localhost/api/btc-vault/v1/history?page=3&limit=10')
    const response = await GET(req as never)

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

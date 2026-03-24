import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

vi.mock('./action', () => ({
  fetchBtcVaultHistoryPageAndEnrich: vi.fn(),
}))

import { fetchBtcVaultHistoryPageAndEnrich, type BtcVaultHistoryItem } from './action'

const mockFetchEnrich = vi.mocked(fetchBtcVaultHistoryPageAndEnrich)

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
  mockFetchEnrich.mockClear()
})

describe('GET /api/btc-vault/v1/history', () => {
  it('should return 200 with correct data and pagination shape (no address)', async () => {
    mockFetchEnrich.mockResolvedValue({ data: mockHistory, total: 1, source: 'the-graph', errors: [] })

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
    expect(response.headers.get('X-Source')).toBe('the-graph')
    expect(response.headers.get('X-Source-Errors')).toBeNull()
  })

  it('should call fetch with global semantics when no address provided', async () => {
    mockFetchEnrich.mockResolvedValue({ data: [], total: 0, source: 'the-graph', errors: [] })

    const req = new Request('http://localhost/api/btc-vault/v1/history')
    await GET(req as never)

    expect(mockFetchEnrich).toHaveBeenCalledWith(
      expect.objectContaining({
        address: undefined,
      }),
    )
  })

  it('should pass address to fetch when provided', async () => {
    mockFetchEnrich.mockResolvedValue({ data: [], total: 0, source: 'the-graph', errors: [] })

    const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'
    const req = new Request(`http://localhost/api/btc-vault/v1/history?address=${address}`)
    const response = await GET(req as never)

    expect(response.status).toBe(200)
    expect(mockFetchEnrich).toHaveBeenCalledWith(
      expect.objectContaining({
        address,
      }),
    )
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
    mockFetchEnrich.mockResolvedValue({ data: [], total: 0, source: 'the-graph', errors: [] })

    const req = new Request(
      'http://localhost/api/btc-vault/v1/history?type=deposit_request&type=redeem_claimed',
    )
    const response = await GET(req as never)

    expect(response.status).toBe(200)
    expect(mockFetchEnrich).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ['deposit_request', 'redeem_claimed'],
      }),
    )
  })

  it('should return 200 with empty data when no results', async () => {
    mockFetchEnrich.mockResolvedValue({ data: [], total: 0, source: 'the-graph', errors: [] })

    const req = new Request('http://localhost/api/btc-vault/v1/history')
    const response = await GET(req as never)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toEqual([])
    expect(body.pagination.total).toBe(0)
    expect(body.pagination.totalPages).toBe(0)
  })

  it('should pass query parameters correctly', async () => {
    mockFetchEnrich.mockResolvedValue({ data: [], total: 0, source: 'the-graph', errors: [] })

    const req = new Request(
      'http://localhost/api/btc-vault/v1/history?page=2&limit=10&sort_field=assets&sort_direction=asc',
    )
    const response = await GET(req as never)

    expect(response.status).toBe(200)
    expect(mockFetchEnrich).toHaveBeenCalledWith({
      limit: 10,
      page: 2,
      sort_field: 'assets',
      sort_direction: 'asc',
      type: undefined,
      address: undefined,
    })
  })

  it('should compute pagination correctly for multiple pages', async () => {
    mockFetchEnrich.mockResolvedValue({ data: mockHistory, total: 45, source: 'the-graph', errors: [] })

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

  it('should set X-Source blockscout and X-Source-Errors when subgraph failed and Blockscout succeeds', async () => {
    mockFetchEnrich.mockResolvedValue({
      data: mockHistory,
      total: 1,
      source: 'blockscout',
      errors: [{ source: 'the-graph', message: 'subgraph down' }],
    })

    const req = new Request('http://localhost/api/btc-vault/v1/history')
    const response = await GET(req as never)

    expect(response.status).toBe(200)
    expect(response.headers.get('X-Source')).toBe('blockscout')
    expect(response.headers.get('X-Source-Errors')).toContain('the-graph: subgraph down')
  })

  it('should return 500 when no data source succeeds', async () => {
    mockFetchEnrich.mockResolvedValue({
      data: [],
      total: 0,
      source: null,
      errors: [
        { source: 'the-graph', message: 'down' },
        { source: 'blockscout', message: 'down' },
      ],
    })

    const req = new Request('http://localhost/api/btc-vault/v1/history')
    const response = await GET(req as never)

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toBe('Cannot fetch BTC vault history from any source')
    expect(response.headers.get('X-Source-Errors')).toContain('the-graph: down')
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

vi.mock('@/app/api/vault/v1/addresses/[address]/history/action', () => ({
  getVaultHistoryFromDB: vi.fn(),
  getVaultHistoryCountFromDB: vi.fn(),
}))

import {
  getVaultHistoryFromDB,
  getVaultHistoryCountFromDB,
  type VaultHistoryByPeriodAndAction,
} from './action'

const mockGetVaultHistoryFromDB = vi.mocked(getVaultHistoryFromDB)
const mockGetVaultHistoryCountFromDB = vi.mocked(getVaultHistoryCountFromDB)

const mockVaultHistory: VaultHistoryByPeriodAndAction[] = [
  {
    period: '2025-12',
    action: 'DEPOSIT',
    assets: '80000000000000000000',
    transactions: [
      {
        user: '0xa18f4fbee88592bee3d51d90ba791e769a9b902f',
        action: 'DEPOSIT',
        assets: '20000000000000000000',
        shares: '7017527349025885572318346',
        blockNumber: '7136040',
        timestamp: 1765816647,
        transactionHash: '0x78f9b9...',
      },
    ],
  },
]

beforeEach(() => {
  mockGetVaultHistoryFromDB.mockReset()
  mockGetVaultHistoryCountFromDB.mockReset()
})

describe('GET /api/vault/v1/addresses/[address]/history', () => {
  it('should return 400 for invalid address format', async () => {
    const req = new Request('http://localhost/api/vault/v1/addresses/invalid-address/history')
    const response = await GET(req as never, { params: Promise.resolve({ address: 'invalid-address' }) })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation failed')
  })

  it('should return vault history with default pagination', async () => {
    mockGetVaultHistoryFromDB.mockResolvedValue(mockVaultHistory)
    mockGetVaultHistoryCountFromDB.mockResolvedValue(1)

    const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'
    const req = new Request(`http://localhost/api/vault/v1/addresses/${address}/history`)
    const response = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data.data).toEqual(mockVaultHistory)
    expect(data.pagination).toEqual({
      page: 1,
      limit: 20,
      offset: 0,
      total: 1,
      totalPages: 1,
      sort_field: 'period',
      sort_direction: 'desc',
    })
  })

  it('should pass query parameters to DB functions', async () => {
    mockGetVaultHistoryFromDB.mockResolvedValue([])
    mockGetVaultHistoryCountFromDB.mockResolvedValue(0)

    const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'
    const req = new Request(
      `http://localhost/api/vault/v1/addresses/${address}/history?page=2&limit=10&sort_field=assets&sort_direction=asc&type=deposit`,
    )
    const response = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(response.status).toBe(200)
    expect(mockGetVaultHistoryFromDB).toHaveBeenCalledWith({
      address,
      limit: 10,
      page: 2,
      sort_field: 'assets',
      sort_direction: 'asc',
      type: ['deposit'],
    })
  })

  it('should filter by multiple types', async () => {
    mockGetVaultHistoryFromDB.mockResolvedValue([])
    mockGetVaultHistoryCountFromDB.mockResolvedValue(0)

    const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'
    const req = new Request(
      `http://localhost/api/vault/v1/addresses/${address}/history?type=deposit&type=withdraw`,
    )
    const response = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(response.status).toBe(200)
    expect(mockGetVaultHistoryFromDB).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        type: ['deposit', 'withdraw'],
      }),
    )
  })

  it('should return 400 for invalid sort_field value', async () => {
    const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'
    const req = new Request(`http://localhost/api/vault/v1/addresses/${address}/history?sort_field=invalid`)
    const response = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation failed')
  })

  it('should return 400 for limit exceeding max', async () => {
    const address = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'
    const req = new Request(`http://localhost/api/vault/v1/addresses/${address}/history?limit=999`)
    const response = await GET(req as never, { params: Promise.resolve({ address }) })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation failed')
  })

  it('should return 400 for empty address (0x)', async () => {
    const req = new Request('http://localhost/api/vault/v1/addresses/0x/history')
    const response = await GET(req as never, { params: Promise.resolve({ address: '0x' }) })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation failed')
  })
})

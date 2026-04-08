import { describe, it, expect, vi } from 'vitest'

import { GET } from './route'

const mockFetchPrices = vi.fn()

vi.mock('@/app/user/Balances/actions', () => ({
  fetchPrices: (...args: unknown[]) => mockFetchPrices(...args),
}))

describe('GET /api/prices', () => {
  it('should return prices as JSON', async () => {
    const fakePrices = {
      rBTC: { price: 60000, lastUpdated: '2026-04-08T00:00:00Z' },
      RIF: { price: 0.05, lastUpdated: '2026-04-08T00:00:00Z' },
    }
    mockFetchPrices.mockResolvedValue(fakePrices)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(fakePrices)
  })

  it('should return 500 when fetchPrices throws', async () => {
    mockFetchPrices.mockRejectedValue(new Error('CMC unavailable'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('CMC unavailable')
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./action', () => ({
  getCachedEpochHistory: vi.fn(),
}))

import { getCachedEpochHistory } from './action'
import { GET } from './route'

const mockGetCachedEpochHistory = vi.mocked(getCachedEpochHistory)

const epoch = {
  epochId: '1',
  reportedOffchainAssets: '0',
  assets: '1000',
  supply: '1000',
  closedAt: '1500000',
  apy: null,
}

describe('GET /api/btc-vault/v1/epoch-history', () => {
  beforeEach(() => {
    mockGetCachedEpochHistory.mockReset()
  })

  it('returns the epochs and their source', async () => {
    mockGetCachedEpochHistory.mockResolvedValue({ epochs: [epoch], source: 'blockscout', errors: [] })

    const res = await GET()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([epoch])
    expect(res.headers.get('X-Source')).toBe('blockscout')
  })

  it('returns 500 without the source errors when no source returns epochs', async () => {
    mockGetCachedEpochHistory.mockResolvedValue({
      epochs: [],
      source: null,
      errors: [{ source: 'blockscout', message: 'fetch failed: connect ECONNREFUSED 10.0.0.1:443' }],
    })

    const res = await GET()

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({
      success: false,
      error: 'Internal server error',
      errorId: expect.any(String),
    })
    expect(res.headers.get('X-Source-Errors')).toBeNull()
  })

  it('returns a generic 500 when loading the epochs throws', async () => {
    mockGetCachedEpochHistory.mockRejectedValue(new Error('connect ECONNREFUSED 10.0.0.1:443'))

    const res = await GET()

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({
      success: false,
      error: 'Internal server error',
      errorId: expect.any(String),
    })
    expect(res.headers.get('X-Source-Errors')).toBeNull()
  })
})

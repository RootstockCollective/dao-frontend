import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockFetchClaims } = vi.hoisted(() => ({ mockFetchClaims: vi.fn() }))

vi.mock('./stateSync', () => ({ fetchBackerRewardsClaimedFromStateSync: mockFetchClaims }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }))

import { GET } from './route'

const GAUGE = '0x1111111111111111111111111111111111111111'

const request = (query: string) => new Request(`http://localhost/api/gauges/backer-rewards-claimed?${query}`)

describe('GET /api/gauges/backer-rewards-claimed', () => {
  beforeEach(() => mockFetchClaims.mockReset())

  it('answers with the claims keyed by gauge', async () => {
    mockFetchClaims.mockResolvedValue({ [GAUGE]: [] })

    const res = await GET(request(`gauges=${GAUGE}`))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ [GAUGE]: [] })
    expect(mockFetchClaims).toHaveBeenCalledWith([GAUGE])
  })

  it.each(['', 'gauges=0x123'])('rejects %j before reading state-sync', async query => {
    const res = await GET(request(query))

    expect(res.status).toBe(400)
    expect(mockFetchClaims).not.toHaveBeenCalled()
  })

  it('answers 503 with Retry-After when state-sync fails, rather than a partial map', async () => {
    mockFetchClaims.mockRejectedValueOnce(new Error('connection terminated'))

    const res = await GET(request(`gauges=${GAUGE}`))

    expect(res.status).toBe(503)
    expect(res.headers.get('Retry-After')).toBe('5')
    expect(await res.json()).toEqual({ error: 'Failed to fetch backer reward claims' })
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockFetchClaims } = vi.hoisted(() => ({ mockFetchClaims: vi.fn() }))

vi.mock('./stateSync', () => ({ fetchBuilderRewardsClaimedFromStateSync: mockFetchClaims }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }))

import { GET } from './route'

const GAUGE = '0x1111111111111111111111111111111111111111'
const RIF = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

const call = (gauge: string) =>
  GET(new Request(`http://localhost/api/gauges/${gauge}/builder-rewards-claimed`), {
    params: Promise.resolve({ gauge }),
  })

describe('GET /api/gauges/[gauge]/builder-rewards-claimed', () => {
  beforeEach(() => mockFetchClaims.mockReset())

  it('answers with the claimed amount per token', async () => {
    mockFetchClaims.mockResolvedValue({ [RIF]: '5' })

    const res = await call(GAUGE)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ [RIF]: '5' })
    expect(mockFetchClaims).toHaveBeenCalledWith(GAUGE)
  })

  it('rejects an invalid gauge before reading state-sync', async () => {
    const res = await call('0x123')

    expect(res.status).toBe(400)
    expect(mockFetchClaims).not.toHaveBeenCalled()
  })

  it('answers 503 with Retry-After when state-sync fails', async () => {
    mockFetchClaims.mockRejectedValueOnce(new Error('connection terminated'))

    const res = await call(GAUGE)

    expect(res.status).toBe(503)
    expect(res.headers.get('Retry-After')).toBe('5')
    expect(await res.json()).toEqual({ error: 'Failed to fetch builder reward claims' })
  })
})

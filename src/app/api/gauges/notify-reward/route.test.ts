import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockFetchNotifyReward } = vi.hoisted(() => ({ mockFetchNotifyReward: vi.fn() }))

vi.mock('./stateSync', () => ({ fetchNotifyRewardFromStateSync: mockFetchNotifyReward }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }))

import { GET } from './route'

const GAUGE = '0x1111111111111111111111111111111111111111'

const request = (query: string) => new Request(`http://localhost/api/gauges/notify-reward?${query}`)

describe('GET /api/gauges/notify-reward', () => {
  beforeEach(() => mockFetchNotifyReward.mockReset())

  it('answers with the events keyed by gauge', async () => {
    mockFetchNotifyReward.mockResolvedValue({ [GAUGE]: [] })

    const res = await GET(request(`gauges=${GAUGE}`))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ [GAUGE]: [] })
    expect(mockFetchNotifyReward).toHaveBeenCalledWith([GAUGE], { fromTimestamp: undefined })
  })

  it('passes fromTimestamp through as a number', async () => {
    mockFetchNotifyReward.mockResolvedValue({ [GAUGE]: [] })

    await GET(request(`gauges=${GAUGE}&fromTimestamp=1750000000`))

    expect(mockFetchNotifyReward).toHaveBeenCalledWith([GAUGE], { fromTimestamp: 1750000000 })
  })

  it.each([
    ['-1', '-1'],
    ['1.5', '1.5'],
    ['abc', 'abc'],
    ['empty', ''],
    ['1e3', '1e3'],
    // Parses to Infinity, which would silently empty every history.
    ['400 digits', '9'.repeat(400)],
  ])('rejects fromTimestamp %s without reading state-sync', async (_label, value) => {
    const res = await GET(request(`gauges=${GAUGE}&fromTimestamp=${value}`))

    expect(res.status).toBe(400)
    expect(mockFetchNotifyReward).not.toHaveBeenCalled()
  })

  it('rejects a request without gauges before reading state-sync', async () => {
    const res = await GET(request(''))

    expect(res.status).toBe(400)
    expect(mockFetchNotifyReward).not.toHaveBeenCalled()
  })

  it('answers 503 with Retry-After when state-sync fails, rather than a partial map', async () => {
    mockFetchNotifyReward.mockRejectedValueOnce(new Error('relation "GaugeNotifyReward" does not exist'))

    const res = await GET(request(`gauges=${GAUGE}`))

    expect(res.status).toBe(503)
    expect(res.headers.get('Retry-After')).toBe('5')
    expect(await res.json()).toEqual({ error: 'Failed to fetch NotifyReward events' })
  })
})

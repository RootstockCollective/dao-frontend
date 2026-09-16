import type { Hex } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { buildGaugeEventsResponse } from './fetch-gauge-events'

vi.mock('@/lib/constants', () => ({
  BLOCKSCOUT_URL: 'https://blockscout.test',
  EVENTS_FROM_BLOCK: 6958707,
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}))

const TOPIC: Hex = '0x72421f1eeaa316f3b67618996c0df193d45328d3645bb1866b6beb11a0c8230e'
const ROUTE = '/api/gauges/backer-rewards-claimed'

const GAUGE_A = '0xa7671bd525f529b60bf9f6c28fbe5d64f2cd0d73'
const GAUGE_B = '0x0e6ee0c15a701a9d8b8449615a2a1ee017aa22e5'

const request = (query: string) => new Request(`https://app.test${ROUTE}?${query}`)

const emptyLogsResponse = () =>
  new Response(JSON.stringify({ status: '0', message: 'No logs found', result: [] }), { status: 200 })

const rateLimitedResponse = () =>
  new Response(
    JSON.stringify({ status: '0', message: 'Too many requests. Increase limits now', result: null }),
    { status: 429, headers: { 'x-ratelimit-limit': '10', 'x-ratelimit-remaining': '0' } },
  )

describe('buildGaugeEventsResponse', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('rejects a missing gauges param', async () => {
    const response = await buildGaugeEventsResponse(request('') as Request, TOPIC, ROUTE)
    expect(response.status).toBe(400)
  })

  it('returns a log map keyed by gauge when every gauge resolves', async () => {
    global.fetch = vi.fn().mockImplementation(async () => emptyLogsResponse())

    const response = await buildGaugeEventsResponse(
      request(`gauges=${GAUGE_A},${GAUGE_B}`),
      TOPIC,
      ROUTE,
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ [GAUGE_A]: [], [GAUGE_B]: [] })
  })

  it('answers 503 with Retry-After and the failing gauges instead of an opaque 500', async () => {
    global.fetch = vi.fn().mockImplementation(async (input: string | URL) => {
      return String(input).includes(GAUGE_B) ? rateLimitedResponse() : emptyLogsResponse()
    })

    const response = await buildGaugeEventsResponse(
      request(`gauges=${GAUGE_A},${GAUGE_B}`),
      TOPIC,
      ROUTE,
    )

    expect(response.status).toBe(503)
    expect(response.headers.get('Retry-After')).toBe('5')

    const body = await response.json()
    expect(body.failedGauges).toEqual([GAUGE_B])
    // Never surface a partial map: the client reads missing gauges as "nothing claimed".
    expect(body).not.toHaveProperty(GAUGE_A)
  })
})

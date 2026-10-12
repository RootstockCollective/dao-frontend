import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { configureBlockscoutThrottle, resetBlockscoutThrottle } from '@/lib/blockscout/request-throttle'

import { fetchVaultLogsAllPagesForTopic } from './fetch-logs'

vi.mock('@/lib/constants', () => ({ CHAIN_ID: '30' }))

const VAULT = '0x1234567890abcdef1234567890abcdef12345678'
const TOPIC = '0x72421f1eeaa316f3b67618996c0df193d45328d3645bb1866b6beb11a0c8230e'

describe('fetchVaultLogsAllPagesForTopic', () => {
  const originalEnv = { ...process.env }
  const mockFetch = vi.fn()

  beforeEach(() => {
    resetBlockscoutThrottle()
    configureBlockscoutThrottle({ minIntervalMs: 0 })
    process.env.NEXT_PUBLIC_BLOCKSCOUT_URL = 'https://rootstock.blockscout.test'
    mockFetch
      .mockReset()
      .mockResolvedValue(
        new Response(JSON.stringify({ status: '0', message: 'No logs found', result: [] }), { status: 200 }),
      )
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.unstubAllGlobals()
    resetBlockscoutThrottle()
  })

  it('sends the PRO key in Authorization and keeps it out of the URL', async () => {
    process.env.BLOCKSCOUT_API_KEY = 'proapi_secret'

    await fetchVaultLogsAllPagesForTopic(VAULT, TOPIC)

    const [calledUrl, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    const url = new URL(calledUrl)
    expect(url.origin + url.pathname).toBe('https://api.blockscout.com/v2/api')
    expect(url.searchParams.get('chain_id')).toBe('30')
    expect(url.searchParams.get('topic0')).toBe(TOPIC)
    expect(url.searchParams.has('apikey')).toBe(false)
    // The throttle reads the key from these headers to park it on a 429.
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer proapi_secret')
  })

  it('sends no Authorization to the public instance', async () => {
    delete process.env.BLOCKSCOUT_API_KEY

    await fetchVaultLogsAllPagesForTopic(VAULT, TOPIC)

    const [calledUrl, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(new URL(calledUrl).origin).toBe('https://rootstock.blockscout.test')
    expect(new Headers(init.headers).get('authorization')).toBeNull()
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/constants', () => ({
  BLOCKSCOUT_URL: 'https://rootstock.blockscout.test',
  CHAIN_ID: '30',
}))

const ADDRESS = '0xa7671bd525f529b60bf9f6c28fbe5d64f2cd0d73' as const
const TOPIC = '0x72421f1eeaa316f3b67618996c0df193d45328d3645bb1866b6beb11a0c8230e' as const

const emptyPage = () =>
  new Response(JSON.stringify({ status: '0', message: 'No logs found', result: [] }), { status: 200 })

/** Both modules read env at import time, so each case needs a fresh registry. */
const loadWithKey = async (apiKey?: string) => {
  vi.resetModules()
  if (apiKey === undefined) {
    delete process.env.BLOCKSCOUT_API_KEY
  } else {
    process.env.BLOCKSCOUT_API_KEY = apiKey
  }
  return import('./fetch-blockscout-get-logs-paginated')
}

const calledUrl = () => new URL((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0])

describe('fetchBlockscoutGetLogsPaginated against the PRO API', () => {
  const originalFetch = global.fetch
  const originalEnv = { ...process.env }

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(async () => emptyPage())
  })

  afterEach(() => {
    global.fetch = originalFetch
    process.env = { ...originalEnv }
    vi.resetModules()
  })

  it('sends chain_id and apikey to the PRO host when a key is configured', async () => {
    const { fetchBlockscoutGetLogsPaginated } = await loadWithKey('proapi_secret')

    await fetchBlockscoutGetLogsPaginated({ query: { address: ADDRESS, topic0: TOPIC } })

    const url = calledUrl()
    expect(url.origin).toBe('https://api.blockscout.com')
    // The PRO API serves the RPC endpoints under /v2/api, not /api.
    expect(url.pathname).toBe('/v2/api')
    expect(url.searchParams.get('chain_id')).toBe('30')
    expect(url.searchParams.get('apikey')).toBe('proapi_secret')
    // The query itself must survive alongside the auth params.
    expect(url.searchParams.get('module')).toBe('logs')
    expect(url.searchParams.get('action')).toBe('getLogs')
    expect(url.searchParams.get('address')).toBe(ADDRESS)
  })

  it('leaves unkeyed environments hitting the public instance exactly as before', async () => {
    const { fetchBlockscoutGetLogsPaginated } = await loadWithKey(undefined)

    await fetchBlockscoutGetLogsPaginated({ query: { address: ADDRESS, topic0: TOPIC } })

    const url = calledUrl()
    expect(url.origin).toBe('https://rootstock.blockscout.test')
    expect(url.pathname).toBe('/api')
    expect(url.searchParams.get('apikey')).toBeNull()
    expect(url.searchParams.get('chain_id')).toBeNull()
  })

  it('never leaks the key onto an explicitly pinned explorer', async () => {
    const { fetchBlockscoutGetLogsPaginated } = await loadWithKey('proapi_secret')

    await fetchBlockscoutGetLogsPaginated({
      query: { address: ADDRESS, topic0: TOPIC },
      blockscoutBaseUrl: 'https://custom.explorer',
    })

    const url = calledUrl()
    expect(url.origin).toBe('https://custom.explorer')
    expect(url.searchParams.get('apikey')).toBeNull()
  })
})

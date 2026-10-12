import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

vi.mock('@/lib/constants', () => ({ CHAIN_ID: '30' }))
vi.mock('@/lib/logger', () => {
  const log = { error: vi.fn(), warn: vi.fn(), info: vi.fn(), child: vi.fn(() => log) }
  return { logger: log }
})

const ADDRESS = '0xa7671bd525f529b60bf9f6c28fbe5d64f2cd0d73'

const call = (address: string) =>
  GET(new Request(`https://app.test/api/rns/${address}`) as never, {
    params: Promise.resolve({ address }),
  })

const calledUrl = () => new URL((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0])

describe('GET /api/rns/[address]', () => {
  const originalFetch = global.fetch
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BLOCKSCOUT_URL = 'https://rootstock.blockscout.test'
    delete process.env.BLOCKSCOUT_API_KEY
  })

  afterEach(() => {
    global.fetch = originalFetch
    process.env = { ...originalEnv }
  })

  it('rejects a malformed address before touching Blockscout', async () => {
    global.fetch = vi.fn()

    const response = await call('not-an-address')

    expect(response.status).toBe(400)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('returns the resolved domain name', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ens_domain_name: 'alice.rsk' }), { status: 200 }))

    const response = await call(ADDRESS)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ens_domain_name: 'alice.rsk' })
  })

  it('reports an address with no domain as null rather than an error', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }))

    await expect((await call(ADDRESS)).json()).resolves.toEqual({ ens_domain_name: null })
  })

  it('treats an unknown address (404 upstream) as no domain', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 404 }))

    const response = await call(ADDRESS)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ens_domain_name: null })
  })

  it('passes upstream rate limiting through as a retryable 503', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 429 }))

    const response = await call(ADDRESS)

    // Not flattened to a 500: the caller should back off and retry, not treat it as broken.
    expect(response.status).toBe(503)
    expect(response.headers.get('Retry-After')).toBe('5')
  })

  it('keeps the key server-side and sends it upstream when configured', async () => {
    process.env.BLOCKSCOUT_API_KEY = 'proapi_secret'
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }))

    await call(ADDRESS)

    const url = calledUrl()
    // REST v2 on the PRO API puts the chain in the path, unlike the RPC style.
    expect(url.origin).toBe('https://api.blockscout.com')
    expect(url.pathname).toBe(`/30/api/v2/addresses/${ADDRESS}`)
    expect(url.searchParams.get('apikey')).toBeNull()
    const init = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer proapi_secret')
    // The per-address cache survives the header: Next only drops caching for auth'd fetches
    // without an explicit revalidate.
    expect(init.next).toEqual({ revalidate: expect.any(Number) })
  })
})

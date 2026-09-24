import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ unstable_cache: <T>(fn: T) => fn }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }))
vi.mock('@/lib/constants', async importOriginal => ({
  ...(await importOriginal<typeof import('@/lib/constants')>()),
  CHAIN_ID: '30',
  GOVERNOR_ADDRESS: '0x2109ca19cb7c87dbdcb44d40c4a7eb0a3d5d1c9e',
}))

import { getProposalsFromBlockscout } from './get-proposals-from-blockscout'

describe('getProposalsFromBlockscout', () => {
  const originalEnv = { ...process.env }
  const mockFetch = vi.fn()

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BLOCKSCOUT_URL = 'https://rootstock.blockscout.test'
    mockFetch.mockReset().mockResolvedValue({
      ok: true,
      json: async () => ({ status: '0', message: 'No logs found', result: [] }),
    })
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.unstubAllGlobals()
  })

  it('sends the PRO key in Authorization and keeps it out of the URL', async () => {
    process.env.BLOCKSCOUT_API_KEY = 'proapi_secret'

    await expect(getProposalsFromBlockscout()).resolves.toEqual([])

    const [calledUrl, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    const url = new URL(calledUrl)
    expect(url.origin + url.pathname).toBe('https://api.blockscout.com/v2/api')
    expect(url.searchParams.get('chain_id')).toBe('30')
    expect(url.searchParams.get('module')).toBe('logs')
    expect(url.searchParams.has('apikey')).toBe(false)
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer proapi_secret')
  })

  it('sends no Authorization to the public instance', async () => {
    delete process.env.BLOCKSCOUT_API_KEY

    await getProposalsFromBlockscout()

    const [calledUrl, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(new URL(calledUrl).origin).toBe('https://rootstock.blockscout.test')
    expect(new Headers(init.headers).get('authorization')).toBeNull()
  })
})

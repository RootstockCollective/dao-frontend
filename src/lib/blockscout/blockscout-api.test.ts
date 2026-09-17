import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/constants', () => ({
  CHAIN_ID: '30',
}))

const PUBLIC_INSTANCE = 'https://rootstock.blockscout.test'

/** The module reads env at import time, so each case needs a fresh module registry. */
const loadWithEnv = async (env: Record<string, string | undefined>) => {
  vi.resetModules()
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
  return import('./blockscout-api')
}

describe('resolveBlockscoutRpcTarget', () => {
  const original = { ...process.env }

  beforeEach(() => {
    delete process.env.BLOCKSCOUT_API_KEY
    delete process.env.BLOCKSCOUT_PRO_API_HOST
    process.env.NEXT_PUBLIC_BLOCKSCOUT_URL = PUBLIC_INSTANCE
  })

  afterEach(() => {
    process.env = { ...original }
    vi.resetModules()
  })

  it('keeps using the public instance when no key is configured', async () => {
    const { resolveBlockscoutRpcTarget, isBlockscoutProApiEnabled } = await loadWithEnv({
      BLOCKSCOUT_API_KEY: undefined,
    })

    const target = resolveBlockscoutRpcTarget()

    expect(target.baseUrl).toBe(PUBLIC_INSTANCE)
    expect(target.authParams).toEqual({})
    expect(target.isPro).toBe(false)
    expect(isBlockscoutProApiEnabled()).toBe(false)
  })

  it('switches to the PRO API and carries chain_id plus apikey once a key is set', async () => {
    const { resolveBlockscoutRpcTarget, isBlockscoutProApiEnabled } = await loadWithEnv({
      BLOCKSCOUT_API_KEY: 'proapi_secret',
    })

    const target = resolveBlockscoutRpcTarget()

    // `/api` is appended by callers, so this must produce https://api.blockscout.com/v2/api.
    expect(target.baseUrl).toBe('https://api.blockscout.com/v2')
    // chain_id is required: one host serves every chain.
    expect(target.authParams).toEqual({ chain_id: '30', apikey: 'proapi_secret' })
    expect(target.isPro).toBe(true)
    expect(isBlockscoutProApiEnabled()).toBe(true)
  })

  it('treats a blank key as absent rather than authenticating with an empty string', async () => {
    const { resolveBlockscoutRpcTarget } = await loadWithEnv({ BLOCKSCOUT_API_KEY: '   ' })

    expect(resolveBlockscoutRpcTarget().isPro).toBe(false)
  })

  it('never redirects an explicit base url override at the PRO API', async () => {
    const { resolveBlockscoutRpcTarget } = await loadWithEnv({ BLOCKSCOUT_API_KEY: 'proapi_secret' })

    const target = resolveBlockscoutRpcTarget('https://custom.explorer')

    expect(target.baseUrl).toBe('https://custom.explorer')
    // Crucially, the key is not leaked onto an instance the caller pinned on purpose.
    expect(target.authParams).toEqual({})
  })

  it('allows the PRO base url to be repointed by env', async () => {
    const { resolveBlockscoutRpcTarget } = await loadWithEnv({
      BLOCKSCOUT_API_KEY: 'proapi_secret',
      BLOCKSCOUT_PRO_API_HOST: 'https://staging.api.blockscout.test',
    })

    expect(resolveBlockscoutRpcTarget().baseUrl).toBe('https://staging.api.blockscout.test/v2')
  })
})

describe('buildBlockscoutRestUrl', () => {
  const original = { ...process.env }

  beforeEach(() => {
    delete process.env.BLOCKSCOUT_API_KEY
    delete process.env.BLOCKSCOUT_PRO_API_HOST
    process.env.NEXT_PUBLIC_BLOCKSCOUT_URL = PUBLIC_INSTANCE
  })

  afterEach(() => {
    process.env = { ...original }
    vi.resetModules()
  })

  it('appends caller params alongside the key', async () => {
    const { buildBlockscoutRestUrl } = await loadWithEnv({ BLOCKSCOUT_API_KEY: 'proapi_key' })

    const url = new URL(buildBlockscoutRestUrl('tokens/0xabc/holders', { items_count: '50' }))

    expect(url.pathname).toBe('/30/api/v2/tokens/0xabc/holders')
    expect(url.searchParams.get('items_count')).toBe('50')
    expect(url.searchParams.get('apikey')).toBe('proapi_key')
  })

  it('keeps the configured key when a caller passes an apikey of its own', async () => {
    const { buildBlockscoutRestUrl } = await loadWithEnv({ BLOCKSCOUT_API_KEY: 'proapi_key' })

    const url = new URL(buildBlockscoutRestUrl('tokens/0xabc/holders', { apikey: 'caller_supplied' }))

    expect(url.searchParams.getAll('apikey')).toEqual(['proapi_key'])
  })
})

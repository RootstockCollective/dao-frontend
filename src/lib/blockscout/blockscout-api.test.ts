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
    expect(target.queryParams).toEqual({})
    expect(target.headers).toEqual({})
    expect(target.isPro).toBe(false)
    expect(isBlockscoutProApiEnabled()).toBe(false)
  })

  it('switches to the PRO API with chain_id in the query and the key in a header', async () => {
    const { resolveBlockscoutRpcTarget, isBlockscoutProApiEnabled } = await loadWithEnv({
      BLOCKSCOUT_API_KEY: 'proapi_secret',
    })

    const target = resolveBlockscoutRpcTarget()

    // `/api` is appended by callers, so this must produce https://api.blockscout.com/v2/api.
    expect(target.baseUrl).toBe('https://api.blockscout.com/v2')
    // chain_id is required: one host serves every chain. The key stays out of the URL.
    expect(target.queryParams).toEqual({ chain_id: '30' })
    expect(target.headers).toEqual({ Authorization: 'Bearer proapi_secret' })
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
    expect(target.queryParams).toEqual({})
    expect(target.headers).toEqual({})
  })

  it('allows the PRO base url to be repointed by env', async () => {
    const { resolveBlockscoutRpcTarget } = await loadWithEnv({
      BLOCKSCOUT_API_KEY: 'proapi_secret',
      BLOCKSCOUT_PRO_API_HOST: 'https://staging.api.blockscout.test',
    })

    expect(resolveBlockscoutRpcTarget().baseUrl).toBe('https://staging.api.blockscout.test/v2')
  })
})

describe('buildBlockscoutRpcRequest', () => {
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

  it('builds the PRO RPC url with chain_id and no key, and puts the key in Authorization', async () => {
    const { buildBlockscoutRpcRequest } = await loadWithEnv({ BLOCKSCOUT_API_KEY: 'proapi_key' })

    const { url, headers } = buildBlockscoutRpcRequest({ module: 'logs', action: 'getLogs' })
    const parsed = new URL(url)

    expect(parsed.origin + parsed.pathname).toBe('https://api.blockscout.com/v2/api')
    expect(Object.fromEntries(parsed.searchParams)).toEqual({
      module: 'logs',
      action: 'getLogs',
      chain_id: '30',
    })
    expect(headers).toEqual({ Authorization: 'Bearer proapi_key' })
  })

  it('drops a caller apikey and keeps chain_id our own', async () => {
    const { buildBlockscoutRpcRequest } = await loadWithEnv({ BLOCKSCOUT_API_KEY: 'proapi_key' })

    const { url } = buildBlockscoutRpcRequest({ module: 'logs', apikey: 'caller_supplied', chain_id: '1' })
    const parsed = new URL(url)

    expect(parsed.searchParams.has('apikey')).toBe(false)
    expect(parsed.searchParams.getAll('chain_id')).toEqual(['30'])
  })

  it('sends no headers to the public instance or a pinned explorer', async () => {
    const unkeyed = await loadWithEnv({ BLOCKSCOUT_API_KEY: undefined })
    expect(unkeyed.buildBlockscoutRpcRequest({ module: 'logs' })).toEqual({
      url: `${PUBLIC_INSTANCE}/api?module=logs`,
      headers: {},
    })

    const keyed = await loadWithEnv({ BLOCKSCOUT_API_KEY: 'proapi_key' })
    expect(keyed.buildBlockscoutRpcRequest({ module: 'logs' }, 'https://custom.explorer')).toEqual({
      url: 'https://custom.explorer/api?module=logs',
      headers: {},
    })
  })
})

describe('buildBlockscoutRestRequest', () => {
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

  it('appends caller params and carries the key in Authorization, not the url', async () => {
    const { buildBlockscoutRestRequest } = await loadWithEnv({ BLOCKSCOUT_API_KEY: 'proapi_key' })

    const { url, headers } = buildBlockscoutRestRequest('tokens/0xabc/holders', { items_count: '50' })
    const parsed = new URL(url)

    expect(parsed.pathname).toBe('/30/api/v2/tokens/0xabc/holders')
    expect(Object.fromEntries(parsed.searchParams)).toEqual({ items_count: '50' })
    expect(url).not.toContain('proapi_key')
    expect(headers).toEqual({ Authorization: 'Bearer proapi_key' })
  })

  it('drops a caller apikey instead of forwarding it', async () => {
    const { buildBlockscoutRestRequest } = await loadWithEnv({ BLOCKSCOUT_API_KEY: 'proapi_key' })

    const { url, headers } = buildBlockscoutRestRequest('tokens/0xabc/holders', { apikey: 'caller_supplied' })

    expect(new URL(url).searchParams.has('apikey')).toBe(false)
    expect(headers).toEqual({ Authorization: 'Bearer proapi_key' })
  })

  it('sends no headers to the public instance', async () => {
    const { buildBlockscoutRestRequest } = await loadWithEnv({ BLOCKSCOUT_API_KEY: undefined })

    expect(buildBlockscoutRestRequest('addresses/0xabc')).toEqual({
      url: `${PUBLIC_INSTANCE}/api/v2/addresses/0xabc`,
      headers: {},
    })
  })
})

describe('withBlockscoutHeaders', () => {
  it("keeps the caller's init and lets our Authorization win over theirs", async () => {
    const { withBlockscoutHeaders } = await import('./blockscout-api')

    const init = withBlockscoutHeaders(
      { next: { revalidate: 25 }, headers: { Accept: 'application/json', authorization: 'Bearer theirs' } },
      { Authorization: 'Bearer ours' },
    )

    expect(init.next).toEqual({ revalidate: 25 })
    const headers = new Headers(init.headers)
    expect(headers.get('authorization')).toBe('Bearer ours')
    expect(headers.get('accept')).toBe('application/json')
  })
})

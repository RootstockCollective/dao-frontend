import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/constants', () => ({
  BLOCKSCOUT_URL: 'https://rootstock.blockscout.test',
  CHAIN_ID: '30',
}))

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

describe('resolveBlockscoutApiTarget', () => {
  const original = { ...process.env }

  beforeEach(() => {
    delete process.env.BLOCKSCOUT_API_KEY
    delete process.env.BLOCKSCOUT_PRO_API_URL
  })

  afterEach(() => {
    process.env = { ...original }
    vi.resetModules()
  })

  it('keeps using the public instance when no key is configured', async () => {
    const { resolveBlockscoutApiTarget, isBlockscoutProApiEnabled } = await loadWithEnv({
      BLOCKSCOUT_API_KEY: undefined,
    })

    const target = resolveBlockscoutApiTarget()

    expect(target.baseUrl).toBe('https://rootstock.blockscout.test')
    expect(target.authParams).toEqual({})
    expect(target.isPro).toBe(false)
    expect(isBlockscoutProApiEnabled()).toBe(false)
  })

  it('switches to the PRO API and carries chain_id plus apikey once a key is set', async () => {
    const { resolveBlockscoutApiTarget, isBlockscoutProApiEnabled } = await loadWithEnv({
      BLOCKSCOUT_API_KEY: 'proapi_secret',
    })

    const target = resolveBlockscoutApiTarget()

    // `/api` is appended by callers, so this must produce https://api.blockscout.com/v2/api.
    expect(target.baseUrl).toBe('https://api.blockscout.com/v2')
    // chain_id is required: one host serves every chain.
    expect(target.authParams).toEqual({ chain_id: '30', apikey: 'proapi_secret' })
    expect(target.isPro).toBe(true)
    expect(isBlockscoutProApiEnabled()).toBe(true)
  })

  it('treats a blank key as absent rather than authenticating with an empty string', async () => {
    const { resolveBlockscoutApiTarget } = await loadWithEnv({ BLOCKSCOUT_API_KEY: '   ' })

    expect(resolveBlockscoutApiTarget().isPro).toBe(false)
  })

  it('never redirects an explicit base url override at the PRO API', async () => {
    const { resolveBlockscoutApiTarget } = await loadWithEnv({ BLOCKSCOUT_API_KEY: 'proapi_secret' })

    const target = resolveBlockscoutApiTarget('https://custom.explorer')

    expect(target.baseUrl).toBe('https://custom.explorer')
    // Crucially, the key is not leaked onto an instance the caller pinned on purpose.
    expect(target.authParams).toEqual({})
  })

  it('allows the PRO base url to be repointed by env', async () => {
    const { resolveBlockscoutApiTarget } = await loadWithEnv({
      BLOCKSCOUT_API_KEY: 'proapi_secret',
      BLOCKSCOUT_PRO_API_URL: 'https://staging.api.blockscout.test/v2',
    })

    expect(resolveBlockscoutApiTarget().baseUrl).toBe('https://staging.api.blockscout.test/v2')
  })
})

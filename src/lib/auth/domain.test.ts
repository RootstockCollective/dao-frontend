import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

async function getDomainModule(env: { NODE_ENV?: string; SIWE_ALLOWED_DOMAINS?: string } = {}) {
  vi.resetModules()
  vi.stubEnv('NODE_ENV', env.NODE_ENV ?? 'production')
  vi.stubEnv('SIWE_ALLOWED_DOMAINS', env.SIWE_ALLOWED_DOMAINS ?? '')
  return import('./domain')
}

describe('assertTrustedHost', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('accepts every deployed hostname', async () => {
    const { assertTrustedHost } = await getDomainModule()

    expect(assertTrustedHost('app.rootstockcollective.xyz')).toEqual({
      domain: 'app.rootstockcollective.xyz',
      origin: 'https://app.rootstockcollective.xyz',
    })

    for (const host of [
      'dev.app.rootstockcollective.xyz',
      'testnet.app.rootstockcollective.xyz',
      'qa.cr.rootstockcollective.xyz',
      'qa.dao.rootstockcollective.xyz',
      'release-candidate.app.rootstockcollective.xyz',
      'release-candidate-testnet.app.rootstockcollective.xyz',
      'release-candidate-mainnet.app.rootstockcollective.xyz',
    ]) {
      expect(assertTrustedHost(host).domain).toBe(host)
    }
  })

  it('rejects an untrusted Host header', async () => {
    const { assertTrustedHost } = await getDomainModule()

    expect(() => assertTrustedHost('untrusted.example')).toThrow(/Untrusted domain/)
  })

  it('does not trust sibling subdomains of the apex', async () => {
    const { assertTrustedHost } = await getDomainModule()

    // Third-party platforms serving user-authored content live here; the app
    // must not extend its sign-in trust to them
    expect(() => assertTrustedHost('gov.rootstockcollective.xyz')).toThrow(/Untrusted domain/)
    expect(() => assertTrustedHost('wiki.rootstockcollective.xyz')).toThrow(/Untrusted domain/)
    expect(() => assertTrustedHost('rootstockcollective.xyz')).toThrow(/Untrusted domain/)
  })

  it('rejects lookalike and malformed authorities that resemble a deployed host', async () => {
    const { assertTrustedHost } = await getDomainModule()

    for (const host of [
      'notapp.rootstockcollective.xyz',
      'app.rootstockcollective.xyz.untrusted.example',
      'app.rootstockcollective.xyz@untrusted.example',
      'untrusted.example@app.rootstockcollective.xyz',
      '.app.rootstockcollective.xyz',
      'app..rootstockcollective.xyz',
      '-app.rootstockcollective.xyz',
      'app_x.rootstockcollective.xyz',
      'app/x.rootstockcollective.xyz',
      'app x.rootstockcollective.xyz',
      'app.rootstockcollective.xyz.',
      'app.rootstockcollective.xyz:99999',
      'app.rootstockcollective.xyz:0',
      '[::1]:3000:4000',
      '[]',
      '',
    ]) {
      expect(() => assertTrustedHost(host), host).toThrow(/Untrusted domain/)
    }
  })

  it('rejects loopback hosts in production', async () => {
    const { assertTrustedHost } = await getDomainModule({ NODE_ENV: 'production' })

    expect(() => assertTrustedHost('localhost:3000')).toThrow(/Untrusted domain/)
  })

  it('accepts loopback hosts outside production and keeps the port in the uri', async () => {
    const { assertTrustedHost } = await getDomainModule({ NODE_ENV: 'development' })

    expect(assertTrustedHost('localhost:3000')).toEqual({
      domain: 'localhost',
      origin: 'http://localhost:3000',
    })
    expect(assertTrustedHost('[::1]:3000').domain).toBe('::1')
  })

  it('uses SIWE_ALLOWED_DOMAINS as the only allowlist when set', async () => {
    const { assertTrustedHost } = await getDomainModule({
      SIWE_ALLOWED_DOMAINS: 'dao.example.org, other.example.org',
    })

    expect(assertTrustedHost('dao.example.org').domain).toBe('dao.example.org')
    expect(assertTrustedHost('other.example.org').domain).toBe('other.example.org')
    // The built-in list no longer applies once the deployment configures its own
    expect(() => assertTrustedHost('app.rootstockcollective.xyz')).toThrow(/Untrusted domain/)
    // Nor do subdomains of a configured domain
    expect(() => assertTrustedHost('sub.dao.example.org')).toThrow(/Untrusted domain/)
  })

  it('normalises case and surrounding whitespace', async () => {
    const { assertTrustedHost } = await getDomainModule()

    expect(assertTrustedHost('APP.RootstockCollective.XYZ').domain).toBe('app.rootstockcollective.xyz')
    expect(assertTrustedHost('  app.rootstockcollective.xyz  ').domain).toBe('app.rootstockcollective.xyz')
  })
})

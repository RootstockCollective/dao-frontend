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

  it('accepts the deployment apex and its subdomains', async () => {
    const { assertTrustedHost } = await getDomainModule()

    expect(assertTrustedHost('rootstockcollective.xyz')).toEqual({
      domain: 'rootstockcollective.xyz',
      origin: 'https://rootstockcollective.xyz',
    })
    expect(assertTrustedHost('app.rootstockcollective.xyz').domain).toBe('app.rootstockcollective.xyz')
    expect(assertTrustedHost('qa.dao.rootstockcollective.xyz').domain).toBe('qa.dao.rootstockcollective.xyz')
  })

  it('rejects an untrusted Host header', async () => {
    const { assertTrustedHost } = await getDomainModule()

    expect(() => assertTrustedHost('untrusted.example')).toThrow(/Untrusted domain/)
  })

  it('rejects lookalike domains that merely contain the apex', async () => {
    const { assertTrustedHost } = await getDomainModule()

    // Suffix match must be on a label boundary, not a substring
    expect(() => assertTrustedHost('notrootstockcollective.xyz')).toThrow(/Untrusted domain/)
    expect(() => assertTrustedHost('rootstockcollective.xyz.untrusted.example')).toThrow(/Untrusted domain/)
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
    // The built-in default no longer applies once the deployment configures its own
    expect(() => assertTrustedHost('app.rootstockcollective.xyz')).toThrow(/Untrusted domain/)
    // Nor do subdomains of a configured domain
    expect(() => assertTrustedHost('sub.dao.example.org')).toThrow(/Untrusted domain/)
  })

  it('normalises case and rejects malformed authorities', async () => {
    const { assertTrustedHost } = await getDomainModule()

    expect(assertTrustedHost('APP.RootstockCollective.XYZ').domain).toBe('app.rootstockcollective.xyz')
    expect(() => assertTrustedHost('app.rootstockcollective.xyz:notaport')).toThrow(/Untrusted domain/)
    expect(() => assertTrustedHost('')).toThrow(/Untrusted domain/)
  })
})

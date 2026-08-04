import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

async function getSanitizeError(nodeEnv: string) {
  vi.resetModules()
  vi.stubEnv('NODE_ENV', nodeEnv)
  const { sanitizeError } = await import('./utils')
  return sanitizeError
}

describe('sanitizeError', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('does not echo the rejected host back in production', async () => {
    const sanitizeError = await getSanitizeError('production')

    const sanitized = sanitizeError('Untrusted domain: untrusted.example')

    expect(sanitized).toBe('Invalid request')
    expect(sanitized).not.toContain('untrusted.example')
  })

  it('reduces every other failure to a generic message in production', async () => {
    const sanitizeError = await getSanitizeError('production')

    expect(sanitizeError('Invalid address format')).toBe('Invalid request')
    expect(sanitizeError('Missing host header')).toBe('Invalid request')
    expect(sanitizeError('Invalid or expired challenge')).toBe('Authentication failed')
    expect(sanitizeError('Signature verification failed: SIGNATURE_MISMATCH')).toBe('Authentication failed')
    expect(sanitizeError('Address mismatch')).toBe('Authentication failed')
  })

  it('keeps the detailed message outside production', async () => {
    const sanitizeError = await getSanitizeError('development')

    expect(sanitizeError('Untrusted domain: untrusted.example')).toBe('Untrusted domain: untrusted.example')
  })
})

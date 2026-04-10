import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn(),
}))

import { proxy } from './proxy'
import { checkRateLimit } from '@/lib/rateLimit'

const mockedCheckRateLimit = vi.mocked(checkRateLimit)

function createRequest(path: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    headers,
  })
}

function allowedResult(limit = 5, remaining = 4) {
  return { success: true, limit, remaining, resetMs: 60_000 }
}

function rejectedResult(limit = 5, resetMs = 30_000) {
  return { success: false, limit, remaining: 0, resetMs }
}

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rate limit enforcement', () => {
    it('returns 429 when rate limit is exceeded', () => {
      mockedCheckRateLimit.mockReturnValue(rejectedResult())

      const response = proxy(createRequest('/api/auth/login'))

      expect(response.status).toBe(429)
    })

    it('includes Retry-After header (in seconds, rounded up) on 429', () => {
      mockedCheckRateLimit.mockReturnValue(rejectedResult(5, 45_500))

      const response = proxy(createRequest('/api/auth/login'))

      expect(response.headers.get('Retry-After')).toBe('46')
    })

    it('includes rate limit headers on 429', () => {
      mockedCheckRateLimit.mockReturnValue(rejectedResult(5))

      const response = proxy(createRequest('/api/auth/login'))

      expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
    })

    it('returns error message in JSON body on 429', async () => {
      mockedCheckRateLimit.mockReturnValue(rejectedResult())

      const response = proxy(createRequest('/api/auth/login'))
      const body = await response.json()

      expect(body.error).toBe('Too many requests. Please try again later.')
    })
  })

  describe('successful requests', () => {
    it('passes through when rate limit is not exceeded', () => {
      mockedCheckRateLimit.mockReturnValue(allowedResult())

      const response = proxy(createRequest('/api/auth/login'))

      expect(response.status).toBe(200)
    })

    it('includes rate limit headers on successful responses', () => {
      mockedCheckRateLimit.mockReturnValue(allowedResult(5, 3))

      const response = proxy(createRequest('/api/auth/login'))

      expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('3')
    })
  })

  describe('route matching', () => {
    it('applies rate limiting to /api/auth/challenge', () => {
      mockedCheckRateLimit.mockReturnValue(allowedResult())

      proxy(createRequest('/api/auth/challenge'))

      expect(mockedCheckRateLimit).toHaveBeenCalledWith(expect.any(String), 'auth_challenge', {
        limit: 5,
        windowMs: 60_000,
      })
    })

    it('applies rate limiting to /api/auth/login', () => {
      mockedCheckRateLimit.mockReturnValue(allowedResult())

      proxy(createRequest('/api/auth/login'))

      expect(mockedCheckRateLimit).toHaveBeenCalledWith(expect.any(String), 'auth_login', {
        limit: 5,
        windowMs: 60_000,
      })
    })

    it('applies rate limiting to /api/auth/verify with higher limit', () => {
      mockedCheckRateLimit.mockReturnValue(allowedResult(20, 19))

      proxy(createRequest('/api/auth/verify'))

      expect(mockedCheckRateLimit).toHaveBeenCalledWith(expect.any(String), 'auth_verify', {
        limit: 20,
        windowMs: 60_000,
      })
    })

    it('passes through for unknown auth sub-routes without rate limiting', () => {
      const response = proxy(createRequest('/api/auth/unknown'))

      expect(response.status).toBe(200)
      expect(mockedCheckRateLimit).not.toHaveBeenCalled()
    })

    it('passes through for non-auth API routes without rate limiting', () => {
      const response = proxy(createRequest('/api/like'))

      expect(response.status).toBe(200)
      expect(mockedCheckRateLimit).not.toHaveBeenCalled()
    })
  })

  describe('IP extraction', () => {
    it('extracts IP from x-forwarded-for header', () => {
      mockedCheckRateLimit.mockReturnValue(allowedResult())

      proxy(createRequest('/api/auth/login', { 'x-forwarded-for': '203.0.113.50' }))

      expect(mockedCheckRateLimit).toHaveBeenCalledWith(
        '203.0.113.50',
        expect.any(String),
        expect.any(Object),
      )
    })

    it('extracts the first IP from a multi-hop x-forwarded-for chain', () => {
      mockedCheckRateLimit.mockReturnValue(allowedResult())

      proxy(
        createRequest('/api/auth/login', { 'x-forwarded-for': '203.0.113.50, 70.41.3.18, 150.172.238.178' }),
      )

      expect(mockedCheckRateLimit).toHaveBeenCalledWith(
        '203.0.113.50',
        expect.any(String),
        expect.any(Object),
      )
    })

    it('falls back to x-real-ip when x-forwarded-for is absent', () => {
      mockedCheckRateLimit.mockReturnValue(allowedResult())

      proxy(createRequest('/api/auth/login', { 'x-real-ip': '198.51.100.14' }))

      expect(mockedCheckRateLimit).toHaveBeenCalledWith(
        '198.51.100.14',
        expect.any(String),
        expect.any(Object),
      )
    })

    it('falls back to 127.0.0.1 when no IP headers are present', () => {
      mockedCheckRateLimit.mockReturnValue(allowedResult())

      proxy(createRequest('/api/auth/login'))

      expect(mockedCheckRateLimit).toHaveBeenCalledWith('127.0.0.1', expect.any(String), expect.any(Object))
    })
  })
})

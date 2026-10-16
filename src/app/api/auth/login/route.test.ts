import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { verifySignature } from '@/lib/auth/actions'
import { signJWT } from '@/lib/auth/jwt.server'

import { POST } from './route'

vi.mock('@/lib/auth/actions', () => ({ verifySignature: vi.fn() }))

vi.mock('@/lib/posthog-server', () => ({
  getPostHogClient: () => ({ identify: vi.fn(), capture: vi.fn(), flush: vi.fn() }),
}))

const mockedVerifySignature = vi.mocked(verifySignature)

const ADDRESS = '0xabcdef0123456789abcdef0123456789abcdef01'

function createRequest(): NextRequest {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeId: 'challenge', signature: '0x1234' }),
  })
}

describe('POST /api/auth/login', () => {
  let token: string

  beforeEach(async () => {
    vi.clearAllMocks()
    token = await signJWT(ADDRESS)
    mockedVerifySignature.mockResolvedValue({ token })
  })

  it('returns the session without the token', async () => {
    const before = Date.now()

    const response = await POST(createRequest())
    const text = await response.text()
    const body = JSON.parse(text)

    expect(response.status).toBe(200)
    expect(text).not.toContain(token)
    expect(Object.keys(body).sort()).toEqual(['expiresAt', 'userAddress'])
    expect(body.userAddress).toBe(ADDRESS)
    expect(body.expiresAt).toBeGreaterThan(before + 23 * 60 * 60 * 1000)
  })

  it('sets the token as an HTTP-only cookie', async () => {
    const response = await POST(createRequest())
    const cookie = response.cookies.get('auth-token')

    expect(cookie?.value).toBe(token)
    expect(cookie?.httpOnly).toBe(true)
  })

  it('rejects a failed signature check', async () => {
    mockedVerifySignature.mockRejectedValue(new Error('Authentication failed'))

    const response = await POST(createRequest())

    expect(response.status).toBe(401)
    expect(response.cookies.get('auth-token')).toBeUndefined()
  })
})

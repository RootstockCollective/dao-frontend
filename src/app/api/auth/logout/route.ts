import { NextRequest, NextResponse } from 'next/server'

import { assertSameOriginRequest } from '@/lib/auth/origin'
import { sanitizeError } from '@/lib/auth/utils'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * POST /api/auth/logout
 *
 * Clear the authentication session by removing the HTTP-only `auth-token`
 * cookie. Because the cookie is HTTP-only, it cannot be cleared from client
 * JavaScript — this endpoint must be called (e.g. on wallet disconnect) so a
 * stale credential does not linger in the browser after sign-out.
 *
 * Response:
 * {
 *   success: true
 * }
 */
export async function POST(request: NextRequest) {
  try {
    assertSameOriginRequest(request)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cross-origin request rejected'
    return NextResponse.json({ error: sanitizeError(message) }, { status: 403 })
  }

  const response = NextResponse.json({ success: true })

  // Overwrite the cookie with an immediately-expired value. The attributes must
  // match those used when setting it in /api/auth/login so the browser replaces
  // the correct cookie.
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}

import { NextResponse } from 'next/server'

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
export async function POST() {
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

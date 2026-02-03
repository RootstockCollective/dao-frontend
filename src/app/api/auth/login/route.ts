import { NextRequest, NextResponse } from 'next/server'
import { verifySignature } from '@/lib/auth/actions'
import { sanitizeError } from '@/lib/auth/utils'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * POST /api/auth/login
 *
 * Verify a signature against a stored challenge and issue a JWT.
 *
 * Request body:
 * {
 *   challengeId: string,  // The challenge ID from requestChallenge server action
 *   signature: string     // The signature of the SIWE message
 * }
 *
 * Response:
 * {
 *   token: string         // JWT token to use for authenticated requests
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { challengeId, signature } = body

    // Input validation is handled by verifySignature() which validates:
    // - challengeId format and existence
    // - signature format (0x hex string)
    // - cryptographic signature verification via SIWE
    const { token } = await verifySignature(challengeId, signature)

    // Return token in response body and as HTTP-only cookie
    const response = NextResponse.json({ token })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    const sanitizedMessage = sanitizeError(message)
    const status = message.includes('Authentication failed') || message.includes('expired') ? 401 : 400
    return NextResponse.json({ error: sanitizedMessage }, { status })
  }
}

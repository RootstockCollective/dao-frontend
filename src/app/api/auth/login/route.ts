import { NextRequest, NextResponse } from 'next/server'

import { verifySignature } from '@/lib/auth/actions'
import { verifyJWT } from '@/lib/auth/jwt.server'
import { sanitizeError } from '@/lib/auth/utils'
import { logger } from '@/lib/logger'
import { getPostHogClient } from '@/lib/posthog-server'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * POST /api/auth/login
 *
 * Verify a signature against a stored challenge and issue a JWT.
 *
 * Request body:
 * {
 *   challengeId: string,  // The challenge ID from /api/auth/challenge
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

    // Track sign-in server-side using the wallet address as distinct ID
    const payload = await verifyJWT(token)
    if (payload?.userAddress) {
      const posthog = getPostHogClient()
      const distinctId = payload.userAddress
      const clientDistinctId = request.headers.get('X-POSTHOG-DISTINCT-ID')
      posthog.identify({ distinctId, properties: { wallet_address: distinctId } })
      posthog.capture({
        distinctId,
        event: 'user_signed_in',
        properties: {
          wallet_address: distinctId,
          ...(clientDistinctId ? { $anon_distinct_id: clientDistinctId } : {}),
        },
      })
      await posthog.shutdown()
    }

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
    logger.error({ err: error, route: '/api/auth/login' }, 'Login error')
    const message = error instanceof Error ? error.message : 'Internal server error'
    const sanitizedMessage = sanitizeError(message)
    const status = message.includes('Authentication failed') || message.includes('expired') ? 401 : 400
    return NextResponse.json({ error: sanitizedMessage }, { status })
  }
}

import { NextRequest, NextResponse } from 'next/server'

import { verifySignature } from '@/lib/auth/actions'
import type { SiweSession } from '@/lib/auth/jwt'
import { verifyJWT } from '@/lib/auth/jwt.server'
import { sanitizeError } from '@/lib/auth/utils'
import { logger } from '@/lib/logger'
import { getPostHogClient } from '@/lib/posthog-server'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * POST /api/auth/login
 *
 * Verify a signature against a stored challenge and issue a JWT in the
 * HTTP-only `auth-token` cookie. The body carries only the session's address
 * and expiry, so page scripts never see the token.
 *
 * Request body:
 * {
 *   challengeId: string,  // The challenge ID from /api/auth/challenge
 *   signature: string     // The signature of the SIWE message
 * }
 *
 * Response:
 * {
 *   userAddress: string,  // Lowercase address the session belongs to
 *   expiresAt: number     // Session expiry, in milliseconds since the epoch
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

    // Track sign-in server-side using the wallet address as distinct ID.
    // Analytics is non-essential: a PostHog failure must never fail an otherwise
    // successful login, so it's isolated from the route's error handling.
    const payload = await verifyJWT(token)
    if (payload?.userAddress) {
      try {
        const posthog = getPostHogClient()
        const distinctId = payload.userAddress
        posthog.identify({ distinctId, properties: { wallet_address: distinctId } })
        posthog.capture({
          distinctId,
          event: 'user_signed_in',
          properties: { wallet_address: distinctId },
        })
        await posthog.flush()
      } catch (analyticsError) {
        logger.error({ err: analyticsError, route: '/api/auth/login' }, 'PostHog tracking failed')
      }
    }

    if (!payload?.exp) {
      throw new Error('Authentication failed')
    }
    const session: SiweSession = { userAddress: payload.userAddress, expiresAt: payload.exp * 1000 }
    const response = NextResponse.json(session)

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

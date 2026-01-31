import { NextRequest, NextResponse } from 'next/server'
import { requestChallenge, verifySignature } from '@/lib/auth/actions'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * GET /api/auth/login
 *
 * Request a SIWE challenge for authentication.
 * The server creates the full SIWE message - the client only provides their address.
 *
 * Query params:
 * - address: The Ethereum address requesting authentication
 *
 * Response:
 * {
 *   challengeId: string,  // ID to reference the challenge when verifying
 *   message: string       // The SIWE message to sign
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get('address')

    if (!address) {
      return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 })
    }

    const result = await requestChallenge(address)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Challenge request error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('Invalid') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

/**
 * POST /api/auth/login
 *
 * Verify a signature against a stored challenge and issue a JWT.
 *
 * Request body:
 * {
 *   challengeId: string,  // The challenge ID from GET /api/auth/login
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
    const status = message.includes('Authentication failed') || message.includes('expired') ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, extractTokenFromRequest } from '@/lib/auth/jwt'

/**
 * POST /api/auth/verify
 *
 * Validates a JWT and returns the decoded payload.
 *
 * Token can be sent via:
 * - Request body: { token: string }
 * - Authorization header: Bearer <token>
 * - Cookie: auth-token
 *
 * Response (valid):
 * { valid: true, userAddress: string }
 *
 * Response (invalid):
 * { valid: false, error: string }
 */
export async function POST(request: NextRequest) {
  try {
    let token: string | null = null

    const contentType = request.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      try {
        const body = await request.json()
        token = body.token ?? null
      } catch {
        // No body or invalid JSON
      }
    }

    if (!token) {
      token = extractTokenFromRequest(request)
    }

    if (!token) {
      return NextResponse.json(
        {
          valid: false,
          error:
            'Missing token. Send token in body { token }, Authorization: Bearer <token>, or auth-token cookie.',
        },
        { status: 400 },
      )
    }

    const userAddress = await verifyJWT(token)

    if (!userAddress) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired token' }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      userAddress,
    })
  } catch (error) {
    console.error('JWT verify error:', error)
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 })
  }
}

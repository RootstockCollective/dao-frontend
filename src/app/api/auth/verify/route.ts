import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, extractTokenFromRequest } from '@/lib/auth/jwt'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Sanitizes error messages for production to prevent information leakage
 * Returns generic error messages in production, detailed messages in development
 */
function sanitizeError(message: string): string {
  if (isProduction) {
    // Generic error messages for production
    if (message.includes('Missing token')) {
      return 'Authentication required'
    }
    if (message.includes('Invalid or expired token')) {
      return 'Authentication failed'
    }
    return 'Authentication failed'
  }
  return message
}

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
          error: sanitizeError(
            'Missing token. Send token in body { token }, Authorization: Bearer <token>, or auth-token cookie.',
          ),
        },
        { status: 400 },
      )
    }

    const userAddress = await verifyJWT(token)

    if (!userAddress) {
      return NextResponse.json(
        { valid: false, error: sanitizeError('Invalid or expired token') },
        { status: 401 },
      )
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

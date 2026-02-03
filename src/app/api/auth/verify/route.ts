import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, extractTokenFromRequest } from '@/lib/auth/jwt'
import { sanitizeError } from '@/lib/auth/utils'

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
    if (contentType && !contentType.includes('application/json')) {
      return NextResponse.json(
        {
          valid: false,
          error: sanitizeError(
            `Unsupported content-type: ${contentType}. Expected application/json or no content-type header.`,
          ),
        },
        { status: 400 },
      )
    }
    if (contentType?.includes('application/json')) {
      try {
        const body = await request.json()
        // Validate that token is a non-empty string if provided
        const bodyToken = body.token
        if (typeof bodyToken === 'string' && bodyToken.trim().length > 0) {
          token = bodyToken.trim()
        }
      } catch (error) {
        // No body or invalid JSON
        console.log('Error parsing request body:', error)
        return NextResponse.json(
          {
            valid: false,
            error: sanitizeError('Invalid JSON in request body'),
          },
          { status: 400 },
        )
      }
    }

    if (token) {
      // Already validated as non-empty string from body (line 31)
    } else {
      token = extractTokenFromRequest(request)
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
    }

    const payload = await verifyJWT(token)

    if (!payload || !payload.userAddress) {
      return NextResponse.json(
        { valid: false, error: sanitizeError('Invalid or expired token') },
        { status: 401 },
      )
    }

    // Address is already normalized to lowercase by verifyJWT
    return NextResponse.json({
      valid: true,
      userAddress: payload.userAddress,
    })
  } catch (error) {
    console.error('JWT verify error:', error)
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 })
  }
}

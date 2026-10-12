import { NextRequest, NextResponse } from 'next/server'

import { requestChallenge } from '@/lib/auth/actions'
import { sanitizeError } from '@/lib/auth/utils'

/**
 * POST /api/auth/challenge
 *
 * Create a SIWE challenge for authentication.
 *
 * Request body:
 * {
 *   address: string  // Ethereum address requesting authentication
 * }
 *
 * Response:
 * {
 *   challengeId: string  // Sealed challenge, sent back as-is during login
 *   message: string      // SIWE message to be signed by the wallet
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address } = body

    const host = request.headers.get('host')

    if (!host) {
      return NextResponse.json({ error: 'Missing host header' }, { status: 400 })
    }

    const result = await requestChallenge(address, host)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Challenge error:', error)
    const message = error instanceof Error ? error.message : 'Challenge request failed'
    const sanitizedMessage = sanitizeError(message)
    return NextResponse.json({ error: sanitizedMessage }, { status: 400 })
  }
}

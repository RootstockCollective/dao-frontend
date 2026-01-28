import { NextRequest, NextResponse } from 'next/server'
import { verifyMessage } from 'viem'
import { SiweMessage } from 'siwe'
import { signJWT } from '@/lib/auth/jwt'
import { validateAndConsumeNonce } from '@/lib/auth/nonceStorage'

/**
 * POST /api/auth/login
 *
 * Verifies a SIWE (Sign-In With Ethereum) signature and issues a JWT session token.
 *
 * Request body:
 * {
 *   message: string,      // The SIWE message that was signed
 *   signature: string,    // The signature of the message
 *   address: string       // The Ethereum address that signed the message
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
    const { message, signature, address } = body

    // Validate required fields
    if (!message || !signature || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: message, signature, and address are required' },
        { status: 400 },
      )
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Invalid address format' }, { status: 400 })
    }

    // Verify the signature using Viem
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    })

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse the SIWE message
    let siweMessage: SiweMessage
    try {
      siweMessage = new SiweMessage(message)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid SIWE message format' }, { status: 400 })
    }

    // Verify the SIWE message with signature
    // Note: We verify with SIWE to check nonce, expiration, domain, etc.
    // We've already verified the signature cryptographically with Viem above
    // Extract domain from the request host header or use the domain from the message
    const host = request.headers.get('host') || ''
    const domain = host.split(':')[0] // Remove port if present

    const verifyResult = await siweMessage.verify({
      signature,
      domain: domain || siweMessage.domain,
    })

    if (!verifyResult.success) {
      return NextResponse.json(
        {
          error: `SIWE verification failed: ${verifyResult.error?.type || 'Invalid message'}`,
        },
        { status: 401 },
      )
    }

    // Get the verified message data
    const fields = verifyResult.data

    // Check that the address in the message matches the provided address
    if (fields.address.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Address in message does not match provided address' },
        { status: 400 },
      )
    }

    // Additional validation: Check expiration explicitly
    if (fields.expirationTime) {
      const expirationDate = new Date(fields.expirationTime)
      const now = new Date()
      if (expirationDate < now) {
        return NextResponse.json({ error: 'Message has expired' }, { status: 401 })
      }
    }

    // Validate nonce from cookies (must exist and not be expired)
    const nonce = fields.nonce
    if (!nonce) {
      return NextResponse.json({ error: 'Missing nonce in message' }, { status: 400 })
    }

    const isNonceValid = await validateAndConsumeNonce(nonce)
    if (!isNonceValid) {
      return NextResponse.json(
        { error: 'Invalid or expired nonce. Please request a new nonce.' },
        { status: 401 },
      )
    }

    // All validations passed - issue JWT token
    const token = await signJWT(address.toLowerCase())

    // Return token in response body
    // Optionally, you can also set it as a cookie:
    const response = NextResponse.json({ token })

    // Set as HTTP-only cookie for additional security
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

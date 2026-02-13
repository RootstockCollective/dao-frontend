import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'
import { JWTPayload } from './jwt'

const JWT_ALGORITHM = 'HS256'
const JWT_EXPIRATION = '24h' // 24 hours session
const JWT_ISSUER = 'rootstock-collective'
const JWT_AUDIENCE = 'rootstock-collective-dapp'

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is not configured')
  }
  console.warn('⚠️  JWT_SECRET environment variable is not configured')
}
const JWT_SECRET = process.env.JWT_SECRET || ''

// Encode the JWT secret once at module initialization
const encodedSecret = new TextEncoder().encode(JWT_SECRET)

/**
 * Signs a JWT token with the user's address
 */
export async function signJWT(userAddress: string): Promise<string> {
  // Normalize address to lowercase for consistency
  const normalizedAddress = userAddress.toLowerCase()

  const token = await new SignJWT({ userAddress: normalizedAddress })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .sign(encodedSecret)

  return token
}

/**
 * Verifies and decodes a JWT token, returning the full payload
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify<JWTPayload>(token, encodedSecret, {
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })

    if (!payload.userAddress) {
      return null
    }

    // Normalize address to lowercase for consistency
    return {
      ...payload,
      userAddress: payload.userAddress.toLowerCase(),
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extracts JWT token from Authorization header or cookie
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim()
    if (token.length > 0) {
      return token
    }
  }

  // Try cookie (using Next.js built-in cookie API)
  const authCookie = request.cookies.get('auth-token')
  const cookieValue = authCookie?.value?.trim()
  return cookieValue && cookieValue.length > 0 ? cookieValue : null
}

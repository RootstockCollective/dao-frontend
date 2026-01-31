import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const JWT_ALGORITHM = 'HS256'
const JWT_EXPIRATION = '24h' // 24 hours session

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is not configured')
  }
  console.warn('⚠️  JWT_SECRET environment variable is not configured')
}
const JWT_SECRET = process.env.JWT_SECRET || ''

export interface JWTPayload {
  userAddress: string
  iat?: number
  exp?: number
}

/**
 * Signs a JWT token with the user's address
 */
export async function signJWT(userAddress: string): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)

  const token = await new SignJWT({ userAddress })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(secret)

  return token
}

/**
 * Verifies and decodes a JWT token, returning the full payload
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify<JWTPayload>(token, secret, {
      algorithms: [JWT_ALGORITHM],
    })

    if (!payload.userAddress) {
      return null
    }

    return payload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Extracts userAddress from a JWT token payload without verification
 * This is a lightweight client-side extraction for display purposes.
 * For security-critical operations, use verifyJWT instead.
 *
 * @param jwtToken - The JWT token string (can be null)
 * @returns The userAddress from the token payload, or null if invalid/not found
 */
export function extractUserAddressFromToken(jwtToken: string | null): string | null {
  if (!jwtToken) return null

  try {
    const payload = JSON.parse(atob(jwtToken.split('.')[1]))
    return payload.userAddress || null
  } catch {
    return null
  }
}

/**
 * Checks if a JWT token is expired (client-side check without verification)
 * This is a lightweight check for UI purposes. For security-critical operations,
 * use verifyJWT which validates signature and expiration server-side.
 *
 * @param jwtToken - The JWT token string (can be null)
 * @returns true if token is expired or invalid, false if still valid
 */
export function isTokenExpired(jwtToken: string | null): boolean {
  if (!jwtToken) return true

  try {
    const payload = JSON.parse(atob(jwtToken.split('.')[1]))
    const exp = payload.exp

    if (!exp) {
      // No expiration claim means token doesn't expire (unlikely but possible)
      return false
    }

    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = exp * 1000
    const now = Date.now()

    return expirationTime < now
  } catch {
    // If we can't parse the token, consider it expired/invalid
    return true
  }
}

/**
 * Extracts JWT token from Authorization header or cookie
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try cookie (using Next.js built-in cookie API)
  const authCookie = request.cookies.get('auth-token')
  return authCookie?.value || null
}

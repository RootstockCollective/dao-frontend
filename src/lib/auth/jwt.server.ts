import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'
import { JWTPayload } from './jwt'

const JWT_ALGORITHM = 'HS256'
const JWT_EXPIRATION = '24h' // 24 hours session
const JWT_ISSUER = 'rootstock-collective'
const JWT_AUDIENCE = 'rootstock-collective-dapp'

let _encodedSecret: Uint8Array | null = null

/**
 * Lazily initializes and returns the encoded JWT secret.
 * The secret is deferred to runtime (instead of module-level initialization)
 * because Next.js evaluates server modules during `npm run build` with
 * NODE_ENV=production. Since JWT_SECRET is not available at build time
 * (and should not be baked into Docker image layers for security reasons),
 * a module-level check would crash the build. The secret is only needed
 * at runtime when signing/verifying tokens, so we validate it here on
 * first use and cache the encoded result for subsequent calls.
 */
function getEncodedSecret(): Uint8Array {
  if (!_encodedSecret) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not configured')
    }
    _encodedSecret = new TextEncoder().encode(process.env.JWT_SECRET)
  }
  return _encodedSecret
}

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
    .sign(getEncodedSecret())

  return token
}

/**
 * Verifies and decodes a JWT token, returning the full payload
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify<JWTPayload>(token, getEncodedSecret(), {
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

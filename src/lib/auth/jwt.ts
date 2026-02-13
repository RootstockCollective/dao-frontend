import { decodeJwt } from 'jose'

export interface JWTPayload {
  userAddress: string
  iat?: number
  exp?: number
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
    const payload = decodeJwt(jwtToken) as JWTPayload
    const address = payload.userAddress
    return address ? address.toLowerCase() : null
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
    const payload = decodeJwt(jwtToken)
    const exp = payload.exp

    if (!exp) {
      return true
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

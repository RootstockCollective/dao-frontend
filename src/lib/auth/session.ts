import { NextRequest } from 'next/server'
import { verifyJWT, extractTokenFromRequest } from './jwt.server'
import { JWTPayload } from './jwt'

/**
 * Extracts and verifies the session payload from the JWT
 * Returns null if no valid session is present
 */
export async function getSession(request: NextRequest): Promise<JWTPayload | null> {
  const token = extractTokenFromRequest(request)
  if (!token) {
    return null
  }

  return await verifyJWT(token)
}

/**
 * Middleware helper to check if a request has a valid session
 * Throws an error if no valid session, otherwise returns the session payload
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  const session = await getSession(request)
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

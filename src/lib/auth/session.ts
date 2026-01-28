import { NextRequest } from 'next/server'
import { verifyJWT, extractTokenFromRequest } from './jwt'

/**
 * Extracts and verifies the user address from the session (JWT)
 * Returns null if no valid session is present
 */
export async function getSessionUserAddress(request: NextRequest): Promise<string | null> {
  const token = extractTokenFromRequest(request)
  if (!token) {
    return null
  }

  return await verifyJWT(token)
}

/**
 * Middleware helper to check if a request has a valid session
 * Throws an error if no valid session, otherwise returns the user address
 */
export async function requireAuth(request: NextRequest): Promise<string> {
  const userAddress = await getSessionUserAddress(request)
  if (!userAddress) {
    throw new Error('Unauthorized')
  }
  return userAddress
}

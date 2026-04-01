import { NextRequest } from 'next/server'
import { JWTPayload } from './jwt'
import { requireAuth } from './session'
import { sanitizeError } from './utils'

/**
 * Type for route handlers that require authentication
 * The handler receives the request and the authenticated session payload
 */
type AuthenticatedRouteHandler = (request: NextRequest, session: JWTPayload) => Promise<Response>

/**
 * Higher-order function that wraps route handlers with authentication middleware
 *
 * Usage:
 *
 * export const POST = withAuth(async (request, session) => {
 *   // session.userAddress is guaranteed to be valid here
 *   const body = await request.json()
 *   // ... your route logic
 * })
 */
export function withAuth(handler: AuthenticatedRouteHandler) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const session = await requireAuth(request)
      return await handler(request, session)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      return Response.json({ error: sanitizeError(message) }, { status: 401 })
    }
  }
}

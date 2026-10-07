export interface JWTPayload {
  userAddress: string
  iat?: number
  exp?: number
}

/**
 * What the client knows about its SIWE session. The JWT itself stays in the
 * HTTP-only `auth-token` cookie, out of reach of page scripts.
 */
export interface SiweSession {
  userAddress: string
  /** Milliseconds since the epoch. */
  expiresAt: number
}

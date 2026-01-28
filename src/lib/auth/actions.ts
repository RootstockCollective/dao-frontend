'use server'

import { storeNonce, cleanupExpiredNonces } from './nonceStorage'
import { randomBytes } from 'crypto'

/**
 * Generate a new nonce for SIWE authentication
 * The nonce is stored in cookies and will expire after 1 minute
 *
 * @returns A random nonce string
 */
export async function generateNonce(): Promise<string> {
  // Clean up expired nonces periodically (every 10th request)
  if (Math.random() < 0.1) {
    await cleanupExpiredNonces()
  }

  // Generate a cryptographically secure random nonce
  const nonce = randomBytes(16).toString('hex')

  // Store nonce in cookie with 1 minute expiration
  await storeNonce(nonce)

  return nonce
}

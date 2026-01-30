'use server'

import { headers } from 'next/headers'
import { SiweMessage } from 'siwe'
import { randomBytes } from 'crypto'
import { storeChallenge, getAndConsumeChallenge } from './challengeStore'
import { signJWT } from './jwt'
import { currentEnvChain } from '@/config/config'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Sanitizes error messages for production to prevent information leakage
 */
function sanitizeError(message: string): string {
  if (isProduction) {
    if (message.includes('Invalid address')) return 'Invalid request'
    if (message.includes('Missing host')) return 'Invalid request'
    if (message.includes('Invalid challenge')) return 'Authentication failed'
    if (message.includes('Invalid signature')) return 'Authentication failed'
    if (message.includes('expired')) return 'Authentication failed'
    if (message.includes('verification failed')) return 'Authentication failed'
    return 'Authentication failed'
  }
  return message
}

interface RequestChallengeResult {
  challengeId: string
  message: string
}

/**
 * Request a SIWE challenge for authentication
 *
 * This server action creates the SIWE message entirely on the server,
 * eliminating any possibility of client-side manipulation of security-critical values.
 *
 * @param address - The Ethereum address requesting authentication
 * @returns The challenge ID and the SIWE message to be signed
 */
export async function requestChallenge(address: string): Promise<RequestChallengeResult> {
  // Validate address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(sanitizeError('Invalid address format'))
  }

  const headersList = await headers()
  const host = headersList.get('host')

  if (!host) {
    throw new Error(sanitizeError('Missing host header'))
  }

  // Extract domain (without port) from host header
  const domain = host.split(':')[0]

  // Determine protocol based on environment
  const protocol = isProduction ? 'https' : 'http'
  const origin = `${protocol}://${host}`

  // Get chain ID from config
  const chainId = currentEnvChain.id

  // Generate cryptographically secure nonce
  const nonce = randomBytes(16).toString('hex')

  // Set expiration to 1 minute
  const expirationTime = new Date(Date.now() + 60 * 1000).toISOString()

  // Create SIWE message with all server-controlled values
  const siweMessage = new SiweMessage({
    domain,
    address,
    statement: 'Sign in to Rootstock Collective',
    uri: origin,
    version: '1',
    chainId,
    nonce,
    expirationTime,
  })

  const message = siweMessage.prepareMessage()

  // Store challenge in server-side memory (single-use, 1-minute expiration)
  const challengeId = storeChallenge({
    message,
    address: address.toLowerCase(),
  })

  return { challengeId, message }
}

interface VerifySignatureResult {
  token: string
}

/**
 * Verify a signature against a stored challenge and issue a JWT
 *
 * This server action retrieves the server-controlled SIWE message from storage,
 * verifies the signature, and issues a JWT token on success.
 *
 * @param challengeId - The ID of the challenge that was signed
 * @param signature - The signature of the SIWE message
 * @returns The JWT token for authenticated requests
 */
export async function verifySignature(
  challengeId: string,
  signature: string,
): Promise<VerifySignatureResult> {
  // Validate challengeId format
  if (!challengeId || typeof challengeId !== 'string') {
    throw new Error(sanitizeError('Invalid challenge ID'))
  }

  // Validate signature format (0x followed by hex characters)
  if (!signature || typeof signature !== 'string' || !/^0x[a-fA-F0-9]+$/.test(signature)) {
    throw new Error(sanitizeError('Invalid signature format'))
  }

  // Retrieve and consume challenge (single-use)
  const challenge = getAndConsumeChallenge(challengeId)

  if (!challenge) {
    throw new Error(sanitizeError('Invalid or expired challenge'))
  }

  // Parse the stored SIWE message
  const siweMessage = new SiweMessage(challenge.message)

  // Verify the signature against the server-controlled message
  let verifyResult: Awaited<ReturnType<typeof siweMessage.verify>>
  try {
    verifyResult = await siweMessage.verify({ signature })
  } catch {
    throw new Error(sanitizeError('Signature verification failed'))
  }

  if (!verifyResult.success) {
    throw new Error(
      sanitizeError(`Signature verification failed: ${verifyResult.error?.type || 'Unknown error'}`),
    )
  }

  // Verify address matches (extra security check)
  if (verifyResult.data.address.toLowerCase() !== challenge.address) {
    throw new Error(sanitizeError('Address mismatch'))
  }

  // All validations passed - issue JWT token
  const token = await signJWT(challenge.address)

  return { token }
}

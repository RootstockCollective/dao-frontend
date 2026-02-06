'use server'

import { headers } from 'next/headers'
import { SiweMessage } from 'siwe'
import { randomBytes } from 'crypto'
import { isAddress, isHex } from 'viem'
import { storeChallenge, getAndConsumeChallenge, CHALLENGE_TTL_MS } from './challengeStore'
import { signJWT } from './jwt.server'
import { isProduction, sanitizeError } from './utils'
import { currentEnvChain } from '@/config/config'

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
  try {
    return await requestChallengeInternal(address)
  } catch (error) {
    // Log the detailed error server-side
    console.error('requestChallenge error:', error)
    // Throw sanitized error to client
    const message = error instanceof Error ? error.message : 'Challenge request failed'
    throw new Error(sanitizeError(message))
  }
}

/**
 * Internal implementation of requestChallenge with detailed error messages
 */
async function requestChallengeInternal(address: string): Promise<RequestChallengeResult> {
  // Validate address format
  if (!isAddress(address)) {
    throw new Error('Invalid address format')
  }

  const headersList = await headers()
  const host = headersList.get('host')

  if (!host) {
    throw new Error('Missing host header')
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

  // Set expiration time using shared constant
  const expirationTime = new Date(Date.now() + CHALLENGE_TTL_MS).toISOString()

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

  // Store challenge in server-side memory (single-use, 4-minute expiration)
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
  try {
    return await verifySignatureInternal(challengeId, signature)
  } catch (error) {
    // Log the detailed error server-side
    console.error('verifySignature error:', error)
    // Throw sanitized error to client
    const message = error instanceof Error ? error.message : 'Signature verification failed'
    throw new Error(sanitizeError(message))
  }
}

/**
 * Internal implementation of verifySignature with detailed error messages
 */
async function verifySignatureInternal(
  challengeId: string,
  signature: string,
): Promise<VerifySignatureResult> {
  // Validate challengeId format
  if (!challengeId || typeof challengeId !== 'string') {
    throw new Error('Invalid challenge ID')
  }

  // Validate signature format (0x followed by hex characters)
  if (!isHex(signature)) {
    throw new Error('Invalid signature format')
  }

  // Retrieve and consume challenge (single-use)
  const challenge = getAndConsumeChallenge(challengeId)

  if (!challenge) {
    throw new Error('Invalid or expired challenge')
  }

  // Parse the stored SIWE message
  const siweMessage = new SiweMessage(challenge.message)

  // Verify the signature against the server-controlled message
  let verifyResult: Awaited<ReturnType<typeof siweMessage.verify>>
  try {
    verifyResult = await siweMessage.verify({ signature })
  } catch {
    throw new Error('Signature verification failed')
  }

  if (!verifyResult.success) {
    throw new Error(`Signature verification failed: ${verifyResult.error?.type || 'Unknown error'}`)
  }

  // Verify address matches (extra security check)
  if (verifyResult.data.address.toLowerCase() !== challenge.address) {
    throw new Error('Address mismatch')
  }

  // All validations passed - issue JWT token
  const token = await signJWT(challenge.address)

  return { token }
}

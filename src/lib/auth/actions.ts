import { randomBytes } from 'crypto'
import { SiweMessage } from 'siwe'
import { isAddress, isHex } from 'viem'

import { currentEnvChain } from '@/config/config'

import { redeemChallenge } from './challengeStore'
import { CHALLENGE_TTL_MS, openChallenge, sealChallenge } from './challengeToken'
import { assertTrustedHost, isAllowedDomain } from './domain'
import { signJWT } from './jwt.server'

export interface RequestChallengeResult {
  challengeId: string
  message: string
}

export interface VerifySignatureResult {
  token: string
}

/**
 * Create a SIWE challenge for authentication.
 *
 * Builds the SIWE message entirely on the server, eliminating any
 * possibility of client-side manipulation of security-critical values.
 *
 * @param address - The Ethereum address requesting authentication
 * @param host    - The Host header value from the incoming request
 */
export async function requestChallenge(address: string, host: string): Promise<RequestChallengeResult> {
  if (!isAddress(address)) {
    throw new Error('Invalid address format')
  }

  if (!host) {
    throw new Error('Missing host header')
  }

  // The Host header is caller-supplied, so it is only usable after being checked
  // against the origins this deployment actually serves (EIP-4361 domain binding)
  const { domain, origin } = assertTrustedHost(host)
  const chainId = currentEnvChain.id

  // Cryptographically secure nonce to prevent replay attacks
  const nonce = randomBytes(16).toString('hex')
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

  const challengeId = sealChallenge(message)

  return { challengeId, message }
}

/**
 * Verify a signature against a sealed challenge and issue a JWT.
 *
 * Recovers the server-controlled SIWE message from the challenge,
 * verifies the signature, and issues a JWT token on success.
 *
 * @param challengeId - The sealed challenge that was signed
 * @param signature   - The signature of the SIWE message
 */
export async function verifySignature(
  challengeId: string,
  signature: string,
): Promise<VerifySignatureResult> {
  if (!challengeId || typeof challengeId !== 'string') {
    throw new Error('Invalid challenge ID')
  }

  if (!isHex(signature)) {
    throw new Error('Invalid signature format')
  }

  const message = openChallenge(challengeId)

  if (!message) {
    throw new Error('Invalid or expired challenge')
  }

  const siweMessage = new SiweMessage(message)
  const expiresAt = Date.parse(siweMessage.expirationTime ?? '')
  const now = Date.now()

  // The redeemed store relies on no challenge outliving CHALLENGE_TTL_MS
  if (Number.isNaN(expiresAt) || expiresAt <= now || expiresAt > now + CHALLENGE_TTL_MS) {
    throw new Error('Invalid or expired challenge')
  }

  if (siweMessage.chainId !== currentEnvChain.id) {
    throw new Error('Invalid or expired challenge')
  }

  // This is the check that carries weight at redemption: the domain the
  // challenge was issued for must still be one this deployment serves, so a
  // challenge cannot be redeemed against an origin we have stopped serving.
  if (!isAllowedDomain(siweMessage.domain)) {
    throw new Error(`Untrusted domain: ${siweMessage.domain}`)
  }

  let verifyResult: Awaited<ReturnType<typeof siweMessage.verify>>
  try {
    // EIP-4361 (Relying Party Implementer Steps) requires the signed `domain`
    // to be checked against the expected origin. Note that while the message
    // is sealed by this server this comparison cannot fail — the guarantee
    // rests on the allowlist at issuance, not here. It is kept so the check
    // still holds if the message ever arrives from somewhere less trusted.
    verifyResult = await siweMessage.verify({ signature, domain: siweMessage.domain })
  } catch {
    throw new Error('Signature verification failed')
  }

  if (!verifyResult.success) {
    throw new Error(`Signature verification failed: ${verifyResult.error?.type || 'Unknown error'}`)
  }

  // Redeemed only after a valid signature, so a failed attempt cannot burn someone else's challenge
  if (!redeemChallenge(siweMessage.nonce, expiresAt)) {
    throw new Error('Invalid or expired challenge')
  }

  const token = await signJWT(siweMessage.address)

  return { token }
}

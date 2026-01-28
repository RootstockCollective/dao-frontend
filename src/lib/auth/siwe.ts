import { SiweMessage } from 'siwe'

/**
 * Generates a SIWE (Sign-In With Ethereum) message for authentication
 *
 * The expiration time is fixed at 2 minutes - just enough time for the user to sign
 * the message and receive the JWT token. The nonce expires in 1 minute, so this gives
 * an additional minute buffer for wallet approval and network latency.
 *
 * @param address - The Ethereum address that will sign the message
 * @param nonce - A unique nonce to prevent replay attacks (must be generated server-side)
 * @param domain - The domain requesting the signature (e.g., window.location.hostname)
 * @param origin - The origin URL (e.g., window.location.origin)
 * @param chainId - The chain ID (default: 31 for Rootstock Testnet)
 * @returns The formatted SIWE message string ready to be signed
 */
export function createSiweMessage(
  address: string,
  nonce: string,
  domain: string,
  origin: string,
  chainId: number = 31, // Default to Rootstock Testnet
): string {
  // 2 minutes expiration - enough time for user to sign and receive JWT, but no longer
  // Nonce expires in 1 minute, so this provides buffer for wallet approval and network latency
  const expiration = new Date(Date.now() + 2 * 60 * 1000) // Fixed: 2 minutes

  const message = new SiweMessage({
    domain,
    address,
    statement: 'Sign in to the dApp.',
    uri: origin,
    version: '1',
    chainId,
    nonce,
    expirationTime: expiration.toISOString(),
  })

  return message.prepareMessage()
}

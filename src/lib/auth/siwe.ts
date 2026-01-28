import { SiweMessage } from 'siwe'

/**
 * Generates a SIWE (Sign-In With Ethereum) message for authentication
 *
 * The expiration time is fixed at 1 minute to match nonce expiration, preventing
 * replay attacks where a signed message could be used after the nonce expires.
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
  // 1 minute expiration - matches nonce expiration to prevent replay attacks
  // This ensures that signed messages cannot be reused after the nonce expires
  const expiration = new Date(Date.now() + 60 * 1000) // Fixed: 1 minute

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

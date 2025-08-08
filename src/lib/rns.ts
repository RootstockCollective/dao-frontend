import { AddrResolver } from '@rsksmart/rns-sdk'
import { RNS_REGISTRY_ADDRESS, NODE_URL, BLOCKSCOUT_URL } from '@/lib/constants'

export const resolveRnsDomain = async (domain: string) => {
  const addrResolver = new AddrResolver(RNS_REGISTRY_ADDRESS, NODE_URL as string)
  try {
    const addr = await addrResolver.addr(domain)
    return addr
  } catch (error) {
    throw new Error('Error resolving RNS domain')
  }
}

/**
 * Fetches ENS domain name for a given Ethereum address from Blockscout API.
 * Uses localStorage cache with 30-second TTL to minimize API calls.
 * Returns the ENS domain name if found, undefined otherwise.
 */
export async function getEnsDomainName(address: string): Promise<string | undefined> {
  // Check if window object exists (for server-side safety)
  if (typeof window === 'undefined') {
    return undefined
  }

  const cacheKey = `ens_${address}`

  // Check localStorage cache
  try {
    const cachedData = localStorage.getItem(cacheKey)
    if (cachedData) {
      const parsed = JSON.parse(cachedData)
      if (Date.now() - parsed.timestamp < 30000) {
        return parsed.result || undefined
      }
    }
  } catch {
    // Ignore cache read errors
  }

  try {
    const response = await fetch(`${BLOCKSCOUT_URL}/api/v2/addresses/${address}`)

    if (!response.ok) {
      localStorage.setItem(cacheKey, JSON.stringify({ result: undefined, timestamp: Date.now() }))
      return undefined
    }

    const data = await response.json()
    const result = data?.ens_domain_name || undefined

    // Cache the result
    localStorage.setItem(cacheKey, JSON.stringify({ result, timestamp: Date.now() }))

    return result
  } catch {
    // Cache negative result on network error
    localStorage.setItem(cacheKey, JSON.stringify({ result: null, timestamp: Date.now() }))
    return undefined
  }
}

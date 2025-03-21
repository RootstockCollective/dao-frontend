import { NftMeta } from '@/shared/types'

/**
 * Applies image transformation options to a Pinata IPFS image URL and appends authentication token
 * @param imageUrl - The original Pinata IPFS image URL
 * @param options - Image transformation options to apply (e.g. width, height, quality)
 * @returns Modified URL string with applied options and authentication token
 *
 * @example
 * ```ts
 * const url = applyImageOptions("ipfs://...", { width: 100, height: 100 });
 * // Returns: "https://gateway.pinata.cloud/ipfs/...?img-width=100&img-height=100..."
 * ```
 */
export function applyPinataImageOptions(imageUrl: string, options: PinataImageOptions = {}) {
  const url = new URL(imageUrl)
  const urlImageOptions = attachPrefixToKeys(options)
  Object.entries(urlImageOptions).forEach(([key, val]) => url.searchParams.append(key, val))
  return appendPinataTokenToUrl(url.toString())
}

/**
 * Fetches NFT metadata from IPFS using the provided CID
 * @param cid - Content Identifier for IPFS
 * @param gateway - Optional IPFS gateway URL
 * @returns Promise resolving to NFT metadata
 * @throws Error if the fetch request fails
 */
export async function fetchIpfsNftMeta(cid: string, gateway?: string): Promise<NftMeta> {
  const gatewayUrl = appendPinataTokenToUrl(ipfsGatewayUrl(cid, gateway))
  const res = await fetch(gatewayUrl)
  if (!res.ok) throw new Error(`Failed to fetch IPFS data: ${res.status} ${res.statusText}`)
  return res.json()
}

/**
 * Constructs a full IPFS gateway URL from a CID (Content Identifier)
 * @param cid - The IPFS Content Identifier to create a URL for
 * @param gateway - Optional IPFS gateway domain. Defaults to the Pinata gateway from environment variables
 * @returns The complete IPFS gateway URL in the format `https://<gateway>/ipfs/<cid>`
 * @throws {Error} If no gateway is provided or found in environment variables
 */
export function ipfsGatewayUrl(cid: string, gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY) {
  if (!gateway) throw new Error('Unknown IPFS gateway')
  cid = removeIpfsPrefix(cid)
  return `https://${gateway}/ipfs/${cid}`
}

/**
 * Interface for Pinata Image Optimization options.
 * Used to customize image serving through Pinata IPFS gateway.
 * For detailed parameters description visit:
 * @see https://docs.pinata.cloud/gateways/image-optimizations
 */
export interface PinataImageOptions {
  width?: number
  height?: number
  dpr?: number
  fit?: 'scaleDown' | 'contain' | 'cover' | 'crop' | 'pad'
  gravity?: 'auto' | 'side' | string
  quality?: number
  format?: 'auto' | 'webp'
  animation?: boolean
  sharpen?: number
  onError?: boolean
  metadata?: 'keep' | 'copyright' | 'none'
}

/**
 * Adds a prefix to all keys in an object and converts them to lowercase.
 * @param obj - The input object to process. Defaults to an empty object.
 * @param prefix - The prefix to add to each key. Defaults to 'img-'.
 * @returns A new object with prefixed lowercase keys and stringified values.
 */
function attachPrefixToKeys(obj: Record<string, any> = {}, prefix = 'img-'): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, val]) => val)
      .map(([key, value]) => [`${prefix}${key}`.toLowerCase(), String(value)]),
  )
}

/**
 * Removes IPFS protocol prefixes from a CID string
 * @param cid - The IPFS CID string to clean (optional)
 * @returns The CID string without 'ipfs://' or '/ipfs/' prefixes
 */
function removeIpfsPrefix(cid?: string) {
  if (!cid) return ''
  return cid.replace(/^ipfs:\/\//, '').replace(/^\/ipfs\//, '')
}

/**
 * Adds Pinata Gateway Token to IPFS URL for development purposes.
 * This function is optional and primarily used during development to access private IPFS gateways.
 * In production environment, the IPFS content should be publicly accessible without the token.
 *
 * @param url - The IPFS URL to which the Pinata token will be appended
 * @returns The URL with appended Pinata Gateway Token if the token exists in environment variables
 */
function appendPinataTokenToUrl(url: string) {
  const urlObj = new URL(url)
  const pinataGatewayToken = process.env.NEXT_PUBLIC_PINATA_GATEWAY_KEY
  if (pinataGatewayToken) urlObj.searchParams.append('pinataGatewayToken', pinataGatewayToken)
  return urlObj.toString()
}

import { NftMeta } from '@/shared/types'

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

export const defaultImageOptions: PinataImageOptions = {
  height: 500,
  width: 500,
  format: 'webp',
}

/**
 * Appends image optimization parameters to a Pinata gateway URL.
 *
 * This function expects a full HTTPS URL that already points to an IPFS resource
 * through a gateway (e.g. https://gateway.pinata.cloud/ipfs/<cid>/...). It does not
 * accept raw `ipfs://` URLs or plain CIDs.
 *
 * The image URL typically comes from the NFT metadata and is first normalized
 * to a gateway URL using `ipfsGatewayUrl()`. Once converted, this function is used
 * to customize how the image will be served through the Pinata gateway
 * — e.g., for different sizes or formats.
 *
 * This is especially useful when the same NFT image is displayed in multiple places
 * on the site (e.g. thumbnail vs full screen), allowing on-the-fly optimization.
 *
 * @param imageUrl - Full gateway-based image URL (HTTPS only)
 * @param options - Pinata image optimization options (width, height, format, etc.)
 * @returns A modified URL with optimization parameters and auth token (if present)
 *
 * @example
 * ```ts
 * const rawImageUrl = ipfsGatewayUrl(nftMeta.image)
 * const optimized = applyPinataImageOptions(rawImageUrl, { width: 300, height: 300 })
 * ```
 */
export function applyPinataImageOptions(
  imageUrl?: string,
  options: PinataImageOptions = defaultImageOptions,
) {
  if (!imageUrl) return ''
  const url = new URL(imageUrl)
  const urlImageOptions = attachPrefixToKeys(options)
  Object.entries(urlImageOptions).forEach(([key, val]) => url.searchParams.append(key, val))
  return appendPinataTokenToUrl(url.toString())
}

/**
 * Fetches NFT metadata from IPFS using the provided CID
 * @param cid - Content Identifier for IPFS
 * @returns Promise resolving to NFT metadata
 * @throws Error if the fetch request fails
 */
export async function fetchIpfsNftMeta(cid: string): Promise<NftMeta> {
  const gatewayUrl = appendPinataTokenToUrl(ipfsGatewayUrl(cid))
  const res = await fetch(gatewayUrl)
  if (!res.ok) throw new Error(`Failed to fetch IPFS data: ${res.status} ${res.statusText}`)
  return res.json()
}

/**
 * Constructs a full IPFS gateway URL from a CID (Content Identifier)
 * @param cid - The IPFS Content Identifier to create a URL for
 * @returns The complete IPFS gateway URL in the format `https://<gateway>/ipfs/<cid>`
 * @throws {Error} If no gateway is provided or found in environment variables
 */
export function ipfsGatewayUrl(cid: string) {
  const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY
  if (!gateway) throw new Error('Unknown IPFS gateway')
  cid = removeIpfsPrefix(cid)
  return `https://${gateway}/ipfs/${cid}`
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

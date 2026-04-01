import { type Address, isAddress } from 'viem'

import { BLOCKSCOUT_URL } from '@/lib/constants'
import { logger } from '@/lib/logger'

export interface StrategyNameInfo {
  address: Address
  name?: string
}

export interface StrategyNamesResponse {
  [address: Address]: string | undefined
}

const MAX_STRATEGY_ADDRESSES = 100

function isSafeHexAddress(value: unknown): value is Address {
  return typeof value === 'string' && isAddress(value)
}

/**
 * Builds an absolute Blockscout URL for the address metadata endpoint.
 * Uses URL parsing + encodeURIComponent so user input cannot alter host or path structure (SSRF hardening).
 */
function blockscoutAddressMetadataUrl(address: Address): string {
  const normalized = address.toLowerCase()
  if (!isAddress(normalized)) {
    throw new TypeError('Invalid address for Blockscout request')
  }
  const base = BLOCKSCOUT_URL.trim().replace(/\/+$/, '')
  const pathSegment = encodeURIComponent(normalized)
  return new URL(`/api/v2/addresses/${pathSegment}`, `${base}/`).toString()
}

/**
 * Logs errors without placing user-controlled strings in the primary message (avoids format-string / log-injection patterns).
 */
function logStrategyNameFetchError(address: Address, error: unknown): void {
  const err =
    error instanceof Error
      ? { name: error.name, message: error.message.replaceAll(/[\r\n]/g, ' ') }
      : { name: 'Unknown', message: String(error).replaceAll(/[\r\n]/g, ' ') }
  logger.error({ address, err, route: '/vault/api/strategy-name' }, 'Error fetching strategy contract name')
}

/**
 * Fetches contract names from Blockscout API for given addresses
 * @param addresses Array of contract addresses to fetch names for
 * @returns Record mapping addresses to their contract names (if verified)
 */
async function getStrategyNames(addresses: Address[]): Promise<StrategyNamesResponse> {
  // Fetch contract data from Blockscout for all addresses in parallel
  const contractDataPromises = addresses.map(async (address): Promise<StrategyNameInfo> => {
    try {
      const url = blockscoutAddressMetadataUrl(address)
      const response = await fetch(url, {
        next: { revalidate: 3600 },
      })

      if (!response.ok) {
        // If request fails, return address without name
        return { address, name: undefined }
      }

      const data = await response.json()

      // Blockscout returns contract name in different fields depending on verification status
      // Try contract_name, name, or implementation_name
      const name =
        data?.implementations?.[0]?.name ||
        data?.contract_name ||
        data?.name ||
        data?.implementation_name ||
        undefined

      return { address, name }
    } catch (error) {
      logStrategyNameFetchError(address, error)
      return { address, name: undefined }
    }
  })

  // Wait for all requests to complete
  const results = await Promise.all(contractDataPromises)

  // Convert array to record format
  return results.reduce<StrategyNamesResponse>((acc, { address, name }) => {
    acc[address] = name
    return acc
  }, {})
}

// Cache for 1 hour (3600 seconds)
export const revalidate = 3600

/**
 * POST endpoint to fetch contract names for strategy addresses
 * @param req Request containing JSON body with addresses array
 * @returns JSON response with mapping of addresses to contract names
 */
export async function POST(req: Request) {
  try {
    const body: unknown = await req.json()

    if (
      body === null ||
      typeof body !== 'object' ||
      !('addresses' in body) ||
      !Array.isArray((body as { addresses: unknown }).addresses)
    ) {
      return Response.json({ error: 'Invalid request: addresses array is required' }, { status: 400 })
    }

    const rawAddresses = (body as { addresses: unknown[] }).addresses
    const validAddresses = rawAddresses.filter(isSafeHexAddress)

    if (validAddresses.length === 0) {
      return Response.json({ error: 'Invalid request: no valid addresses provided' }, { status: 400 })
    }

    if (validAddresses.length > MAX_STRATEGY_ADDRESSES) {
      return Response.json(
        { error: `Invalid request: at most ${MAX_STRATEGY_ADDRESSES} addresses allowed` },
        { status: 400 },
      )
    }

    const result = await getStrategyNames(validAddresses)

    return Response.json(result)
  } catch (error) {
    const err =
      error instanceof Error
        ? { name: error.name, message: error.message.replaceAll(/[\r\n]/g, ' ') }
        : { name: 'Unknown', message: String(error).replaceAll(/[\r\n]/g, ' ') }
    logger.error({ err, route: '/vault/api/strategy-name' }, 'Error in strategy-name API route')
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}

export type StrategyNamesReturnType = StrategyNamesResponse

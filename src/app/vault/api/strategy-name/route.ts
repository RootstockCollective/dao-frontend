import { BLOCKSCOUT_URL } from '@/lib/constants'
import { Address } from 'viem'

export interface StrategyNameInfo {
  address: Address
  name?: string
}

export interface StrategyNamesResponse {
  [address: Address]: string | undefined
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
      const response = await fetch(`${BLOCKSCOUT_URL}/api/v2/addresses/${address}`, {
        // Add cache headers to reduce API load
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
      // On error, return address without name
      console.error(`Error fetching contract name for ${address}:`, error)
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
    const body = await req.json()

    if (!body || !Array.isArray(body.addresses)) {
      return Response.json({ error: 'Invalid request: addresses array is required' }, { status: 400 })
    }

    const addresses = body.addresses as Address[]

    if (addresses.length === 0) {
      return Response.json({} as StrategyNamesResponse)
    }

    const result = await getStrategyNames(addresses)

    return Response.json(result)
  } catch (error) {
    console.error('Error in strategy-name API route:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}

export type StrategyNamesReturnType = StrategyNamesResponse

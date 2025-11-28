import { parseUnits, Address, getAddress } from 'viem'
import Big from '@/lib/big'
import { publicClient } from '@/lib/viemPublicClient'

/**
 * Minimal ERC20 ABI for reading decimals
 */
const ERC20_DECIMALS_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const

/**
 * Convert human-readable amount to contract format (bigint)
 * @param amount - Human-readable amount as string (e.g., "100.5")
 * @param decimals - Number of decimals for the token
 * @returns Amount in contract format as bigint
 */
export function scaleAmount(amount: string, decimals: number): bigint {
  try {
    // Validate input
    if (!amount || amount.trim() === '') {
      throw new Error('Amount cannot be empty')
    }

    // Use viem's parseUnits which handles decimal strings properly
    return parseUnits(amount, decimals)
  } catch (error) {
    throw new Error(
      `Failed to scale amount "${amount}" with ${decimals} decimals: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Calculate price impact percentage
 * @param amountIn - Input amount (human-readable)
 * @param amountOut - Output amount (human-readable)
 * @param spotPrice - Current spot price (output/input) - required to calculate impact
 * @returns Price impact as Big instance (percentage).
 *   - Positive value = worse rate (getting less than spot price, e.g., 5 for 5% worse)
 *   - Negative value = better rate (getting more than spot price, e.g., -5 for 5% better)
 *   - Returns undefined if calculation fails.
 * @example
 * // Getting less than spot (worse)
 * const impact = calculatePriceImpact('100', '95', '1.0') // Returns 5 (5% worse)
 *
 * // Getting more than spot (better)
 * const impact = calculatePriceImpact('100', '105', '1.0') // Returns -5 (5% better)
 */
export function calculatePriceImpact(
  amountIn: string,
  amountOut: string,
  spotPrice: string,
): Big | undefined {
  try {
    const amountInBig = new Big(amountIn)
    const amountOutBig = new Big(amountOut)

    if (amountInBig.lte(0)) {
      return undefined
    }

    // Calculate effective price (output per input) from the swap quote
    const effectivePrice = amountOutBig.div(amountInBig)
    const spotPriceBig = new Big(spotPrice)

    // Price impact = (spotPrice - effectivePrice) / spotPrice * 100
    // Positive = worse (getting less than spot), Negative = better (getting more than spot)
    // Removed .abs() to preserve sign and distinguish better vs worse rates
    const priceImpact = spotPriceBig.minus(effectivePrice).div(spotPriceBig).times(100)
    return priceImpact
  } catch {
    return undefined
  }
}

/**
 * Validate amount string
 * @param amount - Amount string to validate
 * @returns true if amount is valid, false otherwise
 */
export function isValidAmount(amount: string): boolean {
  try {
    const amountBig = new Big(amount)
    // Big.js constructor throws on invalid input, so if we get here it's valid
    // Just check that it's greater than 0
    return amountBig.gt(0)
  } catch {
    return false
  }
}

/**
 * Read decimals from an ERC20 token contract
 * @param tokenAddress - Address of the token contract
 * @returns Number of decimals (e.g., 18 for USDRIF, 6 for USDT0)
 * @throws Error if the contract call fails
 */
export async function getTokenDecimals(tokenAddress: Address): Promise<number> {
  // Normalize address to ensure proper checksumming
  const normalizedAddress = getAddress(tokenAddress)

  try {
    const result = await publicClient.readContract({
      address: normalizedAddress,
      abi: ERC20_DECIMALS_ABI,
      functionName: 'decimals',
    })

    if (typeof result === 'number' && result >= 0 && result <= 255) {
      return result
    }

    throw new Error(`Invalid decimals result: ${result}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to read decimals from token ${tokenAddress}: ${errorMessage}`)
  }
}

/**
 * Read decimals from multiple token contracts in parallel
 * @param tokenAddresses - Array of token addresses
 * @returns Record mapping token addresses to their decimals
 */
export async function getTokenDecimalsBatch(tokenAddresses: Address[]): Promise<Record<Address, number>> {
  // Normalize all addresses to ensure proper checksumming and use as keys
  const normalizedAddresses = tokenAddresses.map(addr => getAddress(addr))

  try {
    // Use multicall for efficiency
    const results = await publicClient.multicall({
      contracts: normalizedAddresses.map(address => ({
        address,
        abi: ERC20_DECIMALS_ABI,
        functionName: 'decimals',
      })),
    })

    // Process results and handle failures
    // Use normalized addresses as keys for consistent lookups
    const decimalsMap: Record<Address, number> = {}
    const failedAddresses: Address[] = []

    results.forEach((result, index) => {
      const normalizedAddress = normalizedAddresses[index]

      if (
        result.status === 'success' &&
        typeof result.result === 'number' &&
        result.result >= 0 &&
        result.result <= 255
      ) {
        decimalsMap[normalizedAddress] = result.result
      } else {
        failedAddresses.push(normalizedAddress)
        // Log failure reason for debugging
        if (result.status === 'failure' && result.error) {
          console.warn(
            `Failed to read decimals for ${normalizedAddress}:`,
            result.error instanceof Error ? result.error.message : result.error,
          )
        }
      }
    })

    // Check if we got decimals for all addresses
    const missingAddresses = normalizedAddresses.filter(addr => typeof decimalsMap[addr] !== 'number')

    if (missingAddresses.length > 0) {
      const errorDetails =
        failedAddresses.length > 0
          ? ` RPC multicall returned failures for: ${failedAddresses.join(', ')}`
          : ''
      throw new Error(`Failed to read decimals for tokens: ${missingAddresses.join(', ')}${errorDetails}`)
    }

    return decimalsMap
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    // Preserve original error details for debugging
    if (error instanceof Error && error.cause) {
      throw new Error(
        `Failed to read decimals batch: ${errorMessage}. Cause: ${error.cause instanceof Error ? error.cause.message : String(error.cause)}`,
      )
    }
    throw new Error(`Failed to read decimals batch: ${errorMessage}`)
  }
}

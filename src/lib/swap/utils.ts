import { Address, getAddress, parseUnits } from 'viem'

import Big from '@/lib/big'
import { publicClient } from '@/lib/viemPublicClient'

import { multicallWithGasEnvelopeRetry } from './multicallWithGasEnvelopeRetry'

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
 * Read decimals from multiple token contracts in one multicall (one RPC round-trip per viem chunk).
 * Duplicate addresses are de-duplicated so each token is read at most once.
 */
export async function getTokenDecimalsBatch(tokenAddresses: Address[]): Promise<Record<Address, number>> {
  const normalizedAddresses = tokenAddresses.map(addr => getAddress(addr))

  if (normalizedAddresses.length === 0) {
    return {}
  }

  const uniqueInOrder: Address[] = []
  const seen = new Set<Address>()
  for (const a of normalizedAddresses) {
    if (!seen.has(a)) {
      seen.add(a)
      uniqueInOrder.push(a)
    }
  }

  try {
    const results = await multicallWithGasEnvelopeRetry(publicClient, {
      contracts: uniqueInOrder.map(address => ({
        address,
        abi: ERC20_DECIMALS_ABI,
        functionName: 'decimals' as const,
      })),
    })

    const byAddress: Partial<Record<Address, number>> = {}
    const failedUnique: Address[] = []

    results.forEach((result, index) => {
      const addr = uniqueInOrder[index]

      if (
        result.status === 'success' &&
        typeof result.result === 'number' &&
        result.result >= 0 &&
        result.result <= 255
      ) {
        byAddress[addr] = result.result
      } else {
        failedUnique.push(addr)
        if (result.status === 'failure' && result.error) {
          console.warn(
            `Failed to read decimals for ${addr}:`,
            result.error instanceof Error ? result.error.message : result.error,
          )
        }
      }
    })

    const decimalsMap: Record<Address, number> = {}
    for (const addr of normalizedAddresses) {
      const d = byAddress[addr]
      if (typeof d === 'number') {
        decimalsMap[addr] = d
      }
    }

    const missingAddresses = normalizedAddresses.filter(addr => typeof decimalsMap[addr] !== 'number')

    if (missingAddresses.length > 0) {
      const errorDetails =
        failedUnique.length > 0 ? ` RPC multicall returned failures for: ${failedUnique.join(', ')}` : ''
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

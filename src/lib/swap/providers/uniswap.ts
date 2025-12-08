import { publicClient } from '@/lib/viemPublicClient'
import { UniswapQuoterV2Abi } from '@/lib/abis/UniswapQuoterV2Abi'
import { ROUTER_ADDRESSES, SWAP_PROVIDERS } from '../constants'
import { formatUnits, encodeAbiParameters, Address, Hex } from 'viem'
import type { SwapProvider, SwapQuote, QuoteParams } from './'
import Big from '@/lib/big'

/**
 * Uniswap V3 Pool Fee Tiers (in basis points)
 * 100 = 0.01%, 500 = 0.05%, 3000 = 0.3%, 10000 = 1%
 */
const UNISWAP_FEE_TIERS: readonly number[] = [3000, 500, 10000, 100]

/**
 * Default fee tier to use when no specific tier is requested
 * This is the fee tier for the USDT0/USDRIF pool on Rootstock mainnet
 */
const DEFAULT_FEE_TIER = 100

/**
 * Type predicate to validate and narrow the quote result type
 * Result should be: [amountOut: bigint, sqrtPriceX96After: bigint, initializedTicksCrossed: number, gasEstimate: bigint]
 */
function isValidQuoteResult(result: unknown): result is [bigint, bigint, number, bigint] {
  if (!Array.isArray(result) || result.length < 4) {
    return false
  }

  const [amountOut, , , gasEstimate] = result

  return (
    typeof amountOut === 'bigint' &&
    typeof result[1] === 'bigint' &&
    typeof result[2] === 'number' &&
    typeof gasEstimate === 'bigint'
  )
}

/**
 * Get a quote for a specific fee tier
 */
async function getQuoteForFee(
  params: QuoteParams,
  fee: number,
  providerName: SwapProvider['name'],
): Promise<SwapQuote> {
  const { tokenIn, tokenOut, amountIn, tokenOutDecimals } = params

  // Call QuoterV2 quoteExactInputSingle
  const rawResult = await publicClient.readContract({
    address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
    abi: UniswapQuoterV2Abi,
    functionName: 'quoteExactInputSingle',
    args: [
      {
        tokenIn,
        tokenOut,
        amountIn,
        fee,
        sqrtPriceLimitX96: 0n, // 0 means no price limit
      },
    ],
  })

  // Validate result structure using type predicate
  if (!isValidQuoteResult(rawResult)) {
    throw new Error(
      `Invalid quote result structure: expected tuple [bigint, bigint, number, bigint], got ${typeof rawResult}`,
    )
  }

  // TypeScript now knows rawResult is [bigint, bigint, number, bigint]
  const [amountOut, , , gasEstimate] = rawResult

  // Format the output amount
  const amountOutFormatted = formatUnits(amountOut, tokenOutDecimals)

  return {
    provider: providerName,
    amountOut: amountOutFormatted,
    amountOutRaw: amountOut.toString(),
    gasEstimate: gasEstimate?.toString(),
  }
}

/**
 * Get a quote from Uniswap
 * If feeTier is specified, uses that exact tier and returns an error if it doesn't exist (no fallback).
 * If feeTier is not specified, uses the default fee tier (100 = 0.01%).
 *
 * Note: Fee tiers are different Uniswap V3 pools (0.01%, 0.05%, 0.3%, 1% fees).
 * This is NOT slippage - slippage tolerance should be handled at swap execution time.
 */
async function getUniswapQuote(params: QuoteParams): Promise<SwapQuote> {
  const providerName = SWAP_PROVIDERS.UNISWAP
  const { feeTier } = params

  // If a specific fee tier is requested, use that exact tier (no fallback)
  if (feeTier !== undefined) {
    try {
      return await getQuoteForFee(params, feeTier, providerName)
    } catch (error) {
      // Contract call failed - pool doesn't exist for this fee tier
      return {
        provider: providerName,
        amountOut: '0',
        amountOutRaw: '0',
        error:
          error instanceof Error
            ? `Pool does not exist for fee tier ${feeTier}: ${error.message}`
            : `Pool does not exist for fee tier ${feeTier}`,
      }
    }
  }

  // No fee tier specified - use default fee tier
  try {
    return await getQuoteForFee(params, DEFAULT_FEE_TIER, providerName)
  } catch (error) {
    // Default tier failed, try all other tiers as fallback
    let bestQuote: SwapQuote | null = null
    const errors: Error[] = []

    // Try all fee tiers in parallel for better performance
    const quotePromises = UNISWAP_FEE_TIERS.map(fee =>
      getQuoteForFee(params, fee, providerName).catch((err: unknown) => {
        errors.push(err instanceof Error ? err : new Error(String(err)))
        return null
      }),
    )

    const quotes = await Promise.all(quotePromises)

    // Find the best quote (highest amountOut)
    for (const quote of quotes) {
      if (quote !== null && (!bestQuote || new Big(quote.amountOut).gt(bestQuote.amountOut))) {
        bestQuote = quote
      }
    }

    // If we got at least one quote, return the best one
    if (bestQuote !== null) {
      return bestQuote
    }

    // If all fee tiers failed, return error quote
    const lastError = errors[errors.length - 1]
    return {
      provider: providerName,
      amountOut: '0',
      amountOutRaw: '0',
      error: lastError ? lastError.message : 'Failed to get quote from Uniswap',
    }
  }
}

/**
 * Execute a swap using Uniswap Universal Router
 * Universal Router uses execute(commands, inputs) pattern
 * Command 0x00 = V3_SWAP_EXACT_IN
 */
export interface ExecuteSwapParams {
  tokenIn: Address
  tokenOut: Address
  amountIn: bigint
  amountOutMinimum: bigint
  poolFee: number
  recipient: Address
}

/**
 * Encode the swap path for Uniswap V3
 * Path format: tokenIn (20 bytes) + fee (3 bytes) + tokenOut (20 bytes) = 43 bytes
 */
function encodeSwapPath(tokenIn: Address, fee: number, tokenOut: Address): Hex {
  // Remove '0x' prefix from addresses
  const tokenInBytes = tokenIn.slice(2)
  const tokenOutBytes = tokenOut.slice(2)

  // Encode fee as uint24 (3 bytes, big-endian)
  // For uint24, we need 3 bytes representing the value
  // Example: fee=100 (0x64) should be encoded as [0x00, 0x00, 0x64]
  // When written as uint32 big-endian: [0x00, 0x00, 0x00, 0x64]
  // We need the last 3 bytes: [0x00, 0x00, 0x64]
  const feeBuffer = new ArrayBuffer(4)
  const feeView = new DataView(feeBuffer)
  feeView.setUint32(0, fee, false) // false = big-endian, writes to bytes 0-3
  const feeBytes = new Uint8Array(feeBuffer)
  // For big-endian uint32, bytes are [MSB, MSB, MSB, LSB]
  // For uint24, we want the value itself, so we take bytes 1-3 (skip the leading zero byte)
  const feeBytes3 = feeBytes.slice(1, 4) // Take bytes 1, 2, 3 (last 3 bytes)

  // Build path: tokenIn (20 bytes) + fee (3 bytes) + tokenOut (20 bytes)
  const feeHex = Array.from(feeBytes3)
    .map((b: number) => b.toString(16).padStart(2, '0'))
    .join('')
  return `0x${tokenInBytes}${feeHex}${tokenOutBytes}` as Hex
}

// Removed executeSwap function - not needed since we use getSwapEncodedData directly

/**
 * Get encoded swap data for Universal Router
 * This is a synchronous helper that returns the encoded command and inputs
 */
export function getSwapEncodedData(params: ExecuteSwapParams): {
  commands: Hex
  inputs: [Hex]
} {
  const { tokenIn, tokenOut, amountIn, amountOutMinimum, poolFee, recipient } = params

  // Encode the swap path
  const path = encodeSwapPath(tokenIn, poolFee, tokenOut)

  // Encode the V3_SWAP_EXACT_IN input
  const input = encodeAbiParameters(
    [
      { name: 'recipient', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMinimum', type: 'uint256' },
      { name: 'path', type: 'bytes' },
      { name: 'payerIsUser', type: 'bool' },
    ],
    [recipient, amountIn, amountOutMinimum, path, true],
  )

  // Command byte: 0x00 = V3_SWAP_EXACT_IN
  const commands = '0x00' as Hex

  return {
    commands,
    inputs: [input as Hex],
  }
}

/**
 * Uniswap swap provider implementation
 * Uses QuoterV2 contract to get quotes
 */
export const uniswapProvider: SwapProvider = {
  name: SWAP_PROVIDERS.UNISWAP,
  getQuote: getUniswapQuote,
}

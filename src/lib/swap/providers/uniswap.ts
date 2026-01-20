import { publicClient } from '@/lib/viemPublicClient'
import { UniswapQuoterV2Abi } from '@/lib/abis/UniswapQuoterV2Abi'
import { ROUTER_ADDRESSES, SWAP_PROVIDERS } from '../constants'
import { formatUnits, encodeAbiParameters, Address, Hex } from 'viem'
import type { SwapProvider, SwapQuote, QuoteParams, QuoteExactOutputParams } from './'
import type { PermitSingle } from '../permit2'
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
 * Get an exact output quote for a specific fee tier
 */
async function getExactOutputQuoteForFee(
  params: QuoteExactOutputParams,
  fee: number,
  providerName: SwapProvider['name'],
): Promise<SwapQuote> {
  const { tokenIn, tokenOut, amountOut, tokenOutDecimals } = params

  // Call QuoterV2 quoteExactOutputSingle
  const rawResult = await publicClient.readContract({
    address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
    abi: UniswapQuoterV2Abi,
    functionName: 'quoteExactOutputSingle',
    args: [
      {
        tokenIn,
        tokenOut,
        amountOut,
        fee,
        sqrtPriceLimitX96: 0n,
      },
    ],
  })

  if (!isValidQuoteResult(rawResult)) {
    throw new Error(
      `Invalid quote result structure: expected tuple [bigint, bigint, number, bigint], got ${typeof rawResult}`,
    )
  }

  const [amountIn, , , gasEstimate] = rawResult
  const amountOutFormatted = formatUnits(amountOut, tokenOutDecimals)

  return {
    provider: providerName,
    amountOut: amountOutFormatted,
    amountOutRaw: amountOut.toString(),
    amountInRaw: amountIn.toString(),
    gasEstimate: gasEstimate?.toString(),
  }
}

/**
 * Try to get a quote from a specific fee tier, returning the tier info on success
 */
async function tryGetQuoteWithTier(
  params: QuoteParams,
  fee: number,
  providerName: SwapProvider['name'],
): Promise<SwapQuote | null> {
  try {
    const quote = await getQuoteForFee(params, fee, providerName)
    return { ...quote, feeTier: fee }
  } catch {
    return null
  }
}

/**
 * Try to get an exact output quote from a specific fee tier
 */
async function tryGetExactOutputWithTier(
  params: QuoteExactOutputParams,
  fee: number,
  providerName: SwapProvider['name'],
): Promise<SwapQuote | null> {
  try {
    const quote = await getExactOutputQuoteForFee(params, fee, providerName)
    return { ...quote, feeTier: fee }
  } catch {
    return null
  }
}

/**
 * Get the best quote from all available fee tiers
 * Tries all tiers in parallel and returns the one with highest output
 */
async function getBestQuoteFromAllTiers(
  params: QuoteParams,
  providerName: SwapProvider['name'],
): Promise<SwapQuote | null> {
  const quotePromises = UNISWAP_FEE_TIERS.map(fee => tryGetQuoteWithTier(params, fee, providerName))
  const quotes = await Promise.all(quotePromises)

  // Filter successful quotes and find the best one (highest amountOut)
  const validQuotes = quotes.filter((q): q is SwapQuote => q !== null)

  if (validQuotes.length === 0) {
    return null
  }

  return validQuotes.reduce((best, current) =>
    new Big(current.amountOut).gt(best.amountOut) ? current : best,
  )
}

/**
 * Get the best exact output quote from all available fee tiers
 */
async function getBestExactOutputFromAllTiers(
  params: QuoteExactOutputParams,
  providerName: SwapProvider['name'],
): Promise<SwapQuote | null> {
  const quotePromises = UNISWAP_FEE_TIERS.map(fee => tryGetExactOutputWithTier(params, fee, providerName))
  const quotes = await Promise.all(quotePromises)

  const validQuotes = quotes.filter((q): q is SwapQuote => q !== null)
  if (validQuotes.length === 0) {
    return null
  }

  return validQuotes.reduce((best, current) => {
    if (!best.amountInRaw || !current.amountInRaw) {
      return best
    }
    return new Big(current.amountInRaw).lt(best.amountInRaw) ? current : best
  })
}

/**
 * Get a quote from Uniswap
 * Strategy:
 * - If feeTier is specified: use ONLY that tier (no fallback)
 * - Otherwise: try default tier first, fallback to all tiers
 *
 * Note: Fee tiers are different Uniswap V3 pools (0.01%, 0.05%, 0.3%, 1% fees).
 * This is NOT slippage - slippage tolerance should be handled at swap execution time.
 */
async function getUniswapQuote(params: QuoteParams): Promise<SwapQuote> {
  const providerName = SWAP_PROVIDERS.UNISWAP

  // If specific fee tier is requested, only try that tier (no fallback)
  if (params.feeTier !== undefined) {
    const quote = await tryGetQuoteWithTier(params, params.feeTier, providerName)
    if (quote) {
      return quote
    }
    return {
      provider: providerName,
      amountOut: '0',
      amountOutRaw: '0',
      error: `Pool does not exist for fee tier ${params.feeTier}`,
    }
  }

  // No specific tier - try default tier first (fast path for most common case)
  const defaultQuote = await tryGetQuoteWithTier(params, DEFAULT_FEE_TIER, providerName)
  if (defaultQuote) {
    return defaultQuote
  }

  // Default tier failed - try all tiers to find one with liquidity
  const bestQuote = await getBestQuoteFromAllTiers(params, providerName)
  if (bestQuote) {
    return bestQuote
  }

  // All tiers failed - no liquidity available
  return {
    provider: providerName,
    amountOut: '0',
    amountOutRaw: '0',
    error: 'No liquidity available. All pool fee tiers failed to provide a quote.',
  }
}

/**
 * Get an exact output quote from Uniswap
 * Strategy:
 * - If feeTier is specified: use ONLY that tier (no fallback)
 * - Otherwise: try default tier first, fallback to all tiers
 */
async function getUniswapExactOutputQuote(params: QuoteExactOutputParams): Promise<SwapQuote> {
  const providerName = SWAP_PROVIDERS.UNISWAP

  // If specific fee tier is requested, only try that tier (no fallback)
  if (params.feeTier !== undefined) {
    const quote = await tryGetExactOutputWithTier(params, params.feeTier, providerName)
    if (quote) {
      return quote
    }
    return {
      provider: providerName,
      amountOut: '0',
      amountOutRaw: '0',
      error: `Pool does not exist for fee tier ${params.feeTier}`,
    }
  }

  // No specific tier - try default tier first
  const defaultQuote = await tryGetExactOutputWithTier(params, DEFAULT_FEE_TIER, providerName)
  if (defaultQuote) {
    return defaultQuote
  }

  const bestQuote = await getBestExactOutputFromAllTiers(params, providerName)
  if (bestQuote) {
    return bestQuote
  }

  return {
    provider: providerName,
    amountOut: '0',
    amountOutRaw: '0',
    error: 'No liquidity available. All pool fee tiers failed to provide a quote.',
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

// =============================================================================
// PERMIT2_PERMIT + V3_SWAP_EXACT_IN BUNDLE
// =============================================================================

/**
 * Parameters for bundled permit + swap
 */
export interface PermitSwapParams extends ExecuteSwapParams {
  /** PermitSingle struct for Permit2 */
  permit: PermitSingle
  /** EIP-712 signature from user */
  signature: Hex
}

/**
 * Get encoded data for PERMIT2_PERMIT + V3_SWAP_EXACT_IN bundle
 * Commands: 0x0a (PERMIT2_PERMIT) + 0x00 (V3_SWAP_EXACT_IN)
 *
 * This bundles the permit signature with the swap in a single transaction.
 * The permit is executed first, granting the router allowance, then the swap uses that allowance.
 */
export function getPermitSwapEncodedData(params: PermitSwapParams): {
  commands: Hex
  inputs: [Hex, Hex]
} {
  const { tokenIn, tokenOut, amountIn, amountOutMinimum, poolFee, recipient, permit, signature } = params

  // Encode PERMIT2_PERMIT input (command 0x0a)
  // ABI: (PermitSingle permitSingle, bytes signature)
  const permitInput = encodeAbiParameters(
    [
      {
        name: 'permitSingle',
        type: 'tuple',
        components: [
          {
            name: 'details',
            type: 'tuple',
            components: [
              { name: 'token', type: 'address' },
              { name: 'amount', type: 'uint160' },
              { name: 'expiration', type: 'uint48' },
              { name: 'nonce', type: 'uint48' },
            ],
          },
          { name: 'spender', type: 'address' },
          { name: 'sigDeadline', type: 'uint256' },
        ],
      },
      { name: 'signature', type: 'bytes' },
    ],
    [
      {
        details: {
          token: permit.details.token,
          amount: permit.details.amount,
          // uint48 values need to be numbers for viem's encodeAbiParameters
          expiration: Number(permit.details.expiration),
          nonce: Number(permit.details.nonce),
        },
        spender: permit.spender,
        sigDeadline: permit.sigDeadline,
      },
      signature,
    ],
  )

  // Encode V3_SWAP_EXACT_IN input (command 0x00)
  const path = encodeSwapPath(tokenIn, poolFee, tokenOut)
  const swapInput = encodeAbiParameters(
    [
      { name: 'recipient', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMinimum', type: 'uint256' },
      { name: 'path', type: 'bytes' },
      { name: 'payerIsUser', type: 'bool' },
    ],
    [recipient, amountIn, amountOutMinimum, path, true],
  )

  // Commands: 0x0a (PERMIT2_PERMIT) + 0x00 (V3_SWAP_EXACT_IN)
  const commands = '0x0a00' as Hex

  return {
    commands,
    inputs: [permitInput as Hex, swapInput as Hex],
  }
}

/**
 * Uniswap swap provider implementation
 * Uses QuoterV2 contract to get quotes
 */
export const uniswapProvider: SwapProvider = {
  name: SWAP_PROVIDERS.UNISWAP,
  getQuote: getUniswapQuote,
  getQuoteExactOutput: getUniswapExactOutputQuote,
}

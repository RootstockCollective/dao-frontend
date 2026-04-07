import { Address, encodeAbiParameters, formatUnits, Hex } from 'viem'

import { UniswapQuoterV2Abi } from '@/lib/abis/UniswapQuoterV2Abi'
import Big from '@/lib/big'
import { publicClient } from '@/lib/viemPublicClient'

import { feeTierToPercent, ROUTER_ADDRESSES, SWAP_PROVIDERS } from '../constants'
import type { PermitSingle } from '../permit2'
import type { QuoteExactOutputParams, QuoteParams, SwapProvider, SwapQuote } from './'

/**
 * Uniswap V3 Pool Fee Tiers (in basis points)
 * 100 = 0.01%, 500 = 0.05%, 3000 = 0.3%, 10000 = 1%
 */
export const UNISWAP_FEE_TIERS: readonly number[] = [100, 500, 3000, 10000]

function isValidUniswapFeeTier(fee: number): boolean {
  return UNISWAP_FEE_TIERS.includes(fee)
}

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
 * Get a quote for a specific fee tier (single RPC call)
 */
async function getQuoteForSingleTier(
  params: QuoteParams,
  fee: number,
  providerName: SwapProvider['name'],
): Promise<SwapQuote> {
  const { tokenIn, tokenOut, amountIn, tokenOutDecimals } = params

  const rawResult = await publicClient.readContract({
    address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
    abi: UniswapQuoterV2Abi,
    functionName: 'quoteExactInputSingle',
    args: [{ tokenIn, tokenOut, amountIn, fee, sqrtPriceLimitX96: 0n }],
  })

  if (!isValidQuoteResult(rawResult)) {
    throw new Error(
      `Invalid quote result structure: expected tuple [bigint, bigint, number, bigint], got ${typeof rawResult}`,
    )
  }

  const [amountOut, , , gasEstimate] = rawResult
  return {
    provider: providerName,
    amountOut: formatUnits(amountOut, tokenOutDecimals),
    amountOutRaw: amountOut.toString(),
    gasEstimate: gasEstimate?.toString(),
    feeTier: fee,
  }
}

/**
 * Get an exact output quote for a specific fee tier (single RPC call)
 */
async function getExactOutputQuoteForSingleTier(
  params: QuoteExactOutputParams,
  fee: number,
  providerName: SwapProvider['name'],
): Promise<SwapQuote> {
  const { tokenIn, tokenOut, amountOut, tokenOutDecimals } = params

  const rawResult = await publicClient.readContract({
    address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
    abi: UniswapQuoterV2Abi,
    functionName: 'quoteExactOutputSingle',
    args: [{ tokenIn, tokenOut, amountOut, fee, sqrtPriceLimitX96: 0n }],
  })

  if (!isValidQuoteResult(rawResult)) {
    throw new Error(
      `Invalid quote result structure: expected tuple [bigint, bigint, number, bigint], got ${typeof rawResult}`,
    )
  }

  const [amountIn, , , gasEstimate] = rawResult
  return {
    provider: providerName,
    amountOut: formatUnits(amountOut, tokenOutDecimals),
    amountOutRaw: amountOut.toString(),
    amountInRaw: amountIn.toString(),
    gasEstimate: gasEstimate?.toString(),
    feeTier: fee,
  }
}

function buildExactInputContracts(tokenIn: Address, tokenOut: Address, amountIn: bigint) {
  return UNISWAP_FEE_TIERS.map(fee => ({
    address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
    abi: UniswapQuoterV2Abi,
    functionName: 'quoteExactInputSingle' as const,
    args: [{ tokenIn, tokenOut, amountIn, fee, sqrtPriceLimitX96: 0n }] as const,
  }))
}

function buildExactOutputContracts(tokenIn: Address, tokenOut: Address, amountOut: bigint) {
  return UNISWAP_FEE_TIERS.map(fee => ({
    address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
    abi: UniswapQuoterV2Abi,
    functionName: 'quoteExactOutputSingle' as const,
    args: [{ tokenIn, tokenOut, amountOut, fee, sqrtPriceLimitX96: 0n }] as const,
  }))
}

/**
 * Batch-quote all fee tiers for exactIn via a single multicall RPC request.
 * Returns the best quote (highest amountOut) or null if all tiers failed.
 */
async function getBestQuoteFromAllTiers(
  params: QuoteParams,
  providerName: SwapProvider['name'],
): Promise<SwapQuote | null> {
  const { tokenIn, tokenOut, amountIn, tokenOutDecimals } = params

  const results = await publicClient.multicall({
    contracts: buildExactInputContracts(tokenIn, tokenOut, amountIn),
  })

  const validQuotes: SwapQuote[] = []

  results.forEach((result, index) => {
    if (result.status !== 'success' || !isValidQuoteResult(result.result)) return
    const [amountOut, , , gasEstimate] = result.result
    validQuotes.push({
      provider: providerName,
      amountOut: formatUnits(amountOut, tokenOutDecimals),
      amountOutRaw: amountOut.toString(),
      gasEstimate: gasEstimate?.toString(),
      feeTier: UNISWAP_FEE_TIERS[index],
    })
  })

  if (validQuotes.length === 0) return null

  return validQuotes.reduce((best, current) =>
    new Big(current.amountOut).gt(best.amountOut) ? current : best,
  )
}

/**
 * Batch-quote all fee tiers for exactOut via a single multicall RPC request.
 * Returns the best quote (lowest amountIn) or null if all tiers failed.
 */
async function getBestExactOutputFromAllTiers(
  params: QuoteExactOutputParams,
  providerName: SwapProvider['name'],
): Promise<SwapQuote | null> {
  const { tokenIn, tokenOut, amountOut, tokenOutDecimals } = params

  const results = await publicClient.multicall({
    contracts: buildExactOutputContracts(tokenIn, tokenOut, amountOut),
  })

  const validQuotes: SwapQuote[] = []

  results.forEach((result, index) => {
    if (result.status !== 'success' || !isValidQuoteResult(result.result)) return
    const [amountIn, , , gasEstimate] = result.result
    validQuotes.push({
      provider: providerName,
      amountOut: formatUnits(amountOut, tokenOutDecimals),
      amountOutRaw: amountOut.toString(),
      amountInRaw: amountIn.toString(),
      gasEstimate: gasEstimate?.toString(),
      feeTier: UNISWAP_FEE_TIERS[index],
    })
  })

  if (validQuotes.length === 0) return null

  return validQuotes.reduce((best, current) => {
    if (!best.amountInRaw || !current.amountInRaw) return best
    return new Big(current.amountInRaw).lt(best.amountInRaw) ? current : best
  })
}

/**
 * Get a quote from Uniswap
 * Strategy:
 * - If a valid feeTier is specified: try ONLY that tier, no fallback (user explicitly chose it)
 * - Otherwise (auto): multicall all tiers and pick the best quote
 *
 * Fee tiers are different Uniswap V3 pools (0.01%, 0.05%, 0.3%, 1% fees).
 * This is NOT slippage -- slippage tolerance is handled at swap execution time.
 */
async function getUniswapQuote(params: QuoteParams): Promise<SwapQuote> {
  const providerName = SWAP_PROVIDERS.UNISWAP

  // User explicitly selected a fee tier - single RPC call, no fallback
  if (params.feeTier !== undefined && isValidUniswapFeeTier(params.feeTier)) {
    try {
      return await getQuoteForSingleTier(params, params.feeTier, providerName)
    } catch {
      return {
        provider: providerName,
        amountOut: '0',
        amountOutRaw: '0',
        feeTier: params.feeTier,
        error: `No liquidity available in the ${feeTierToPercent(params.feeTier)}% fee pool.`,
      }
    }
  }

  // Auto mode - single multicall probes all tiers and picks the best
  const bestQuote = await getBestQuoteFromAllTiers(params, providerName)
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
 * Get an exact output quote from Uniswap
 * Strategy:
 * - If a valid feeTier is specified: try ONLY that tier, no fallback (user explicitly chose it)
 * - Otherwise (auto): multicall all tiers and pick the best quote (lowest amountIn)
 */
async function getUniswapExactOutputQuote(params: QuoteExactOutputParams): Promise<SwapQuote> {
  const providerName = SWAP_PROVIDERS.UNISWAP

  // User explicitly selected a fee tier - single RPC call, no fallback
  if (params.feeTier !== undefined && isValidUniswapFeeTier(params.feeTier)) {
    try {
      return await getExactOutputQuoteForSingleTier(params, params.feeTier, providerName)
    } catch {
      return {
        provider: providerName,
        amountOut: '0',
        amountOutRaw: '0',
        feeTier: params.feeTier,
        error: `No liquidity available in the ${feeTierToPercent(params.feeTier)}% fee pool.`,
      }
    }
  }

  // Auto mode - single multicall probes all tiers and picks the best
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
 * Check which fee tiers have liquidity for a given token pair.
 * Uses a single multicall with a small test amount to probe all pools at once.
 * Returned tiers are in the same order as UNISWAP_FEE_TIERS.
 * @param tokenIn - Address of the input token
 * @param tokenOut - Address of the output token
 * @param tokenInDecimals - Decimal places for the input token (used to build a test amount)
 * @returns Fee tier numbers with liquidity (e.g. [100, 500]), empty if none
 */
export async function getAvailableFeeTiers(
  tokenIn: Address,
  tokenOut: Address,
  tokenInDecimals: number,
): Promise<number[]> {
  // One full token in raw units (e.g. 1e18 for 18 decimals). Used as the probe for small-decimal tokens.
  const oneFullTokenRaw = 10n ** BigInt(tokenInDecimals)
  // Cap probe size so high-decimal tokens (e.g. 18) do not always quote "1 whole token", which can revert
  // or fail every multicall leg on forked nodes while smaller probes still prove the pool exists.
  const maxProbeRaw = 10n ** 12n
  const testAmount = oneFullTokenRaw > maxProbeRaw ? maxProbeRaw : oneFullTokenRaw

  const results = await publicClient.multicall({
    contracts: buildExactInputContracts(tokenIn, tokenOut, testAmount),
  })

  return results
    .map((result, index) =>
      result.status === 'success' && isValidQuoteResult(result.result) ? UNISWAP_FEE_TIERS[index] : null,
    )
    .filter((fee): fee is number => fee !== null)
}

export const uniswapProvider: SwapProvider = {
  name: SWAP_PROVIDERS.UNISWAP,
  getQuote: getUniswapQuote,
  getQuoteExactOutput: getUniswapExactOutputQuote,
}

import { Address, encodeAbiParameters, formatUnits, Hex } from 'viem'

import { UniswapQuoterV2Abi } from '@/lib/abis/UniswapQuoterV2Abi'
import Big from '@/lib/big'
import { publicClient } from '@/lib/viemPublicClient'

import {
  feeTierToPercent,
  ROUTER_ADDRESSES,
  SWAP_PROVIDERS,
  UNISWAP_FEE_TIERS,
  type UniswapFeeTier,
} from '../constants'
import { multicallWithGasEnvelopeRetry } from '../multicallWithGasEnvelopeRetry'
import type { PermitSingle } from '../permit2'
import { isMultihopRoute, resolveSwapRoute } from '../routes'
import type { QuoteExactOutputParams, QuoteMode, QuoteParams, SwapProvider, SwapQuote } from './'

export { UNISWAP_FEE_TIERS }
export type { UniswapFeeTier } from '../constants'

function isValidUniswapFeeTier(fee: number): boolean {
  return (UNISWAP_FEE_TIERS as readonly number[]).includes(fee)
}

/** Lowercase fingerprint for classifying viem / fetch failures vs expected pool reverts. */
function errorFingerprint(err: unknown): string {
  if (!(err instanceof Error)) return ''
  const ctor = err.constructor?.name ?? ''
  return `${ctor} ${err.name} ${err.message}`.toLowerCase()
}

function isTransportOrInfrastructureError(err: unknown): boolean {
  const fp = errorFingerprint(err)
  return (
    fp.includes('failed to fetch') ||
    fp.includes('fetch failed') ||
    fp.includes('networkerror') ||
    fp.includes('network request failed') ||
    fp.includes('econnrefused') ||
    fp.includes('etimedout') ||
    fp.includes('timeout') ||
    fp.includes('timed out') ||
    fp.includes('rate limit') ||
    fp.includes('too many requests') ||
    fp.includes(' 429') ||
    fp.includes(' 503') ||
    fp.includes('bad gateway') ||
    fp.includes('service unavailable')
  )
}

function isLikelyQuoterContractRevert(err: unknown): boolean {
  const fp = errorFingerprint(err)
  return (
    fp.includes('revert') ||
    fp.includes('execution reverted') ||
    fp.includes('contractfunctionrevertederror') ||
    fp.includes('contractfunctionexecutionerror') ||
    fp.includes('call_exception')
  )
}

/** User-facing error when an explicitly requested fee tier reverts on-chain (uniform multihop vs single pool). */
function swapQuoteNoLiquidityExplicitTier(
  providerName: SwapProvider['name'],
  feeTier: number,
  messageSuffix: 'uniform path' | 'fee pool',
): SwapQuote {
  return {
    provider: providerName,
    amountOut: '0',
    amountOutRaw: '0',
    feeTier,
    error: `No liquidity available in the ${feeTierToPercent(feeTier)}% ${messageSuffix}.`,
  }
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
 * QuoterV2.quoteExactInput(bytes path, uint256 amountIn) / quoteExactOutput(bytes path, uint256 amountOut)
 */
function isValidQuotePathResult(result: unknown): result is [bigint, bigint[], number[], bigint] {
  if (!Array.isArray(result) || result.length < 4) {
    return false
  }
  const [amount, sqrtList, ticksList, gasEstimate] = result
  return (
    typeof amount === 'bigint' &&
    Array.isArray(sqrtList) &&
    Array.isArray(ticksList) &&
    typeof gasEstimate === 'bigint'
  )
}

/** uint24 fee as 3-byte big-endian hex (no 0x). */
function encodeFeeUint24Hex(fee: number): string {
  const feeBuffer = new ArrayBuffer(4)
  const feeView = new DataView(feeBuffer)
  feeView.setUint32(0, fee, false)
  const feeBytes = new Uint8Array(feeBuffer)
  const feeBytes3 = feeBytes.slice(1, 4)
  return Array.from(feeBytes3)
    .map((b: number) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Encode a Uniswap V3 path: token₀ + fee + token₁ + fee + … + tokenₙ.
 * The same `fee` is used for every hop.
 */
export function encodeUniformFeeSwapPath(tokens: readonly Address[], fee: number): Hex {
  if (tokens.length < 2) {
    throw new Error('encodeUniformFeeSwapPath requires at least two tokens')
  }
  const fees = Array.from({ length: tokens.length - 1 }, () => fee)
  return encodePerHopFeeSwapPath(tokens, fees)
}

/**
 * Encode a Uniswap V3 path with a possibly different uint24 fee on each hop.
 */
const UINT24_MAX = 0xffffff

export function encodePerHopFeeSwapPath(tokens: readonly Address[], hopFees: readonly number[]): Hex {
  if (tokens.length < 2) {
    throw new Error('encodePerHopFeeSwapPath requires at least two tokens')
  }
  if (tokens.length !== hopFees.length + 1) {
    throw new Error('encodePerHopFeeSwapPath: hopFees must have length tokens.length - 1')
  }
  for (const f of hopFees) {
    if (!Number.isInteger(f) || f < 0 || f > UINT24_MAX) {
      throw new Error(`encodePerHopFeeSwapPath: hop fee must be uint24 integer, got ${String(f)}`)
    }
  }
  let pathHex = ''
  for (let i = 0; i < tokens.length - 1; i++) {
    pathHex += tokens[i].slice(2) + encodeFeeUint24Hex(hopFees[i])
  }
  pathHex += tokens[tokens.length - 1].slice(2)
  return `0x${pathHex}` as Hex
}

/** Max hops for brute-force fee combination search (4^hops multicall calls). */
const MAX_MULTIHOP_FEE_SEARCH_HOPS = 3

/** Build every possible fee list using {@link UNISWAP_FEE_TIERS} for each hop. */
const feeCombinationsCache = new Map<number, number[][]>()

function cartesianFeeCombinations(hopCount: number): number[][] {
  if (hopCount > MAX_MULTIHOP_FEE_SEARCH_HOPS) {
    throw new Error(
      `Multihop fee search supports at most ${MAX_MULTIHOP_FEE_SEARCH_HOPS} hops (got ${hopCount}). Extend policy explicitly if routes grow.`,
    )
  }

  const cached = feeCombinationsCache.get(hopCount)
  if (cached) {
    return cached
  }

  let combos: number[][] = [[]]
  for (let h = 0; h < hopCount; h++) {
    const next: number[][] = []
    for (const c of combos) {
      for (const f of UNISWAP_FEE_TIERS) {
        next.push([...c, f])
      }
    }
    combos = next
  }

  feeCombinationsCache.set(hopCount, combos)
  return combos
}

function encodePerHopPathForExactOutputQuote(tokens: readonly Address[], hopFees: readonly number[]): Hex {
  const reversedTokens = [...tokens].reverse() as Address[]
  const reversedFees = [...hopFees].reverse()
  return encodePerHopFeeSwapPath(reversedTokens, reversedFees)
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

function buildMultihopUniformFeeExactInputContracts(tokens: readonly Address[], amountIn: bigint) {
  return UNISWAP_FEE_TIERS.map(fee => ({
    address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
    abi: UniswapQuoterV2Abi,
    functionName: 'quoteExactInput' as const,
    args: [encodeUniformFeeSwapPath(tokens, fee), amountIn] as const,
  }))
}

function buildMultihopExactInputContractsAllFeePairs(tokens: readonly Address[], amountIn: bigint) {
  const hopCount = tokens.length - 1
  const combos = cartesianFeeCombinations(hopCount)
  return combos.map(hopFees => ({
    address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
    abi: UniswapQuoterV2Abi,
    functionName: 'quoteExactInput' as const,
    args: [encodePerHopFeeSwapPath(tokens, hopFees), amountIn] as const,
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

function buildMultihopExactOutputContractsAllFeePairs(tokens: readonly Address[], amountOut: bigint) {
  const hopCount = tokens.length - 1
  const combos = cartesianFeeCombinations(hopCount)
  return combos.map(hopFees => ({
    address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
    abi: UniswapQuoterV2Abi,
    functionName: 'quoteExactOutput' as const,
    args: [encodePerHopPathForExactOutputQuote(tokens, hopFees), amountOut] as const,
  }))
}

/**
 * Batch-quote all fee tiers for exactIn via a single Multicall3 `aggregate3` RPC (viem `multicall`).
 * Returns the best quote (highest amountOut) or null if all tiers failed.
 */
async function getBestQuoteFromAllTiers(
  params: QuoteParams,
  providerName: SwapProvider['name'],
): Promise<SwapQuote | null> {
  const { tokenIn, tokenOut, amountIn, tokenOutDecimals } = params

  const results = await multicallWithGasEnvelopeRetry(publicClient, {
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
 * Batch-quote all fee tiers for exactOut via Multicall3 (same pattern as exact-in).
 * Returns the best quote (lowest amountIn) or null if all tiers failed.
 */
async function getBestExactOutputFromAllTiers(
  params: QuoteExactOutputParams,
  providerName: SwapProvider['name'],
): Promise<SwapQuote | null> {
  const { tokenIn, tokenOut, amountOut, tokenOutDecimals } = params

  const results = await multicallWithGasEnvelopeRetry(publicClient, {
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

function selectBetterMultihopQuote(mode: QuoteMode, current: SwapQuote, best: SwapQuote): SwapQuote {
  if (mode === 'exactIn') {
    return new Big(current.amountOut).gt(best.amountOut) ? current : best
  }

  if (!best.amountInRaw || !current.amountInRaw) {
    return best
  }
  return new Big(current.amountInRaw).lt(best.amountInRaw) ? current : best
}

async function getMultihopQuoteExactInUniformTier(
  params: QuoteParams,
  fee: number,
  tokens: readonly Address[],
  providerName: SwapProvider['name'],
): Promise<SwapQuote> {
  const path = encodeUniformFeeSwapPath(tokens, fee)
  const rawResult = await publicClient.readContract({
    address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
    abi: UniswapQuoterV2Abi,
    functionName: 'quoteExactInput',
    args: [path, params.amountIn],
  })

  if (!isValidQuotePathResult(rawResult)) {
    throw new Error(`Invalid multihop quote result: expected path tuple, got ${typeof rawResult}`)
  }

  const [amountOut, , , gasEstimate] = rawResult
  const hopFees = Array.from({ length: tokens.length - 1 }, () => fee)
  return {
    provider: providerName,
    amountOut: formatUnits(amountOut, params.tokenOutDecimals),
    amountOutRaw: amountOut.toString(),
    gasEstimate: gasEstimate?.toString(),
    feeTier: fee,
    hopFees,
  }
}

async function getMultihopQuoteExactOutUniformTier(
  params: QuoteExactOutputParams,
  fee: number,
  tokens: readonly Address[],
  providerName: SwapProvider['name'],
): Promise<SwapQuote> {
  const hopFees = Array.from({ length: tokens.length - 1 }, () => fee)
  const path = encodePerHopPathForExactOutputQuote(tokens, hopFees)
  const rawResult = await publicClient.readContract({
    address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
    abi: UniswapQuoterV2Abi,
    functionName: 'quoteExactOutput',
    args: [path, params.amountOut],
  })

  if (!isValidQuotePathResult(rawResult)) {
    throw new Error(`Invalid multihop exact-out quote result: expected path tuple, got ${typeof rawResult}`)
  }

  const [amountIn, , , gasEstimate] = rawResult
  return {
    provider: providerName,
    amountOut: formatUnits(params.amountOut, params.tokenOutDecimals),
    amountOutRaw: params.amountOut.toString(),
    amountInRaw: amountIn.toString(),
    gasEstimate: gasEstimate?.toString(),
    feeTier: fee,
    hopFees,
  }
}

async function getBestMultihopQuoteExactIn(
  params: QuoteParams,
  tokens: readonly Address[],
  providerName: SwapProvider['name'],
): Promise<SwapQuote | null> {
  const combos = cartesianFeeCombinations(tokens.length - 1)
  const results = await multicallWithGasEnvelopeRetry(publicClient, {
    contracts: buildMultihopExactInputContractsAllFeePairs(tokens, params.amountIn),
  })
  const validQuotes: SwapQuote[] = []

  results.forEach((result, index) => {
    if (result.status !== 'success' || !isValidQuotePathResult(result.result)) return

    const [amountOut, , , gasEstimate] = result.result
    const routeHopFees = combos[index]
    validQuotes.push({
      provider: providerName,
      amountOut: formatUnits(amountOut, params.tokenOutDecimals),
      amountOutRaw: amountOut.toString(),
      gasEstimate: gasEstimate?.toString(),
      feeTier: routeHopFees[0],
      hopFees: routeHopFees,
    })
  })

  if (validQuotes.length === 0) return null
  return validQuotes.reduce((best, current) => selectBetterMultihopQuote('exactIn', current, best))
}

async function getBestMultihopQuoteExactOut(
  params: QuoteExactOutputParams,
  tokens: readonly Address[],
  providerName: SwapProvider['name'],
): Promise<SwapQuote | null> {
  const combos = cartesianFeeCombinations(tokens.length - 1)
  const results = await multicallWithGasEnvelopeRetry(publicClient, {
    contracts: buildMultihopExactOutputContractsAllFeePairs(tokens, params.amountOut),
  })
  const validQuotes: SwapQuote[] = []

  results.forEach((result, index) => {
    if (result.status !== 'success' || !isValidQuotePathResult(result.result)) return

    const [amountIn, , , gasEstimate] = result.result
    const routeHopFees = combos[index]
    validQuotes.push({
      provider: providerName,
      amountOut: formatUnits(params.amountOut, params.tokenOutDecimals),
      amountOutRaw: params.amountOut.toString(),
      amountInRaw: amountIn.toString(),
      gasEstimate: gasEstimate?.toString(),
      feeTier: routeHopFees[0],
      hopFees: routeHopFees,
    })
  })

  if (validQuotes.length === 0) return null
  return validQuotes.reduce((best, current) => selectBetterMultihopQuote('exactOut', current, best))
}

/**
 * Get a quote from Uniswap
 * Strategy:
 * - Multihop + explicit fee: one `quoteExactInput` with the same uint24 fee on every hop.
 * - Multihop auto (`feeTier` unset): multicall over all standard per-hop fee combinations; best output wins.
 * - Single-hop + explicit fee: one call for that tier only.
 * - Single-hop auto: multicall all tiers, pick best output.
 *
 * Fee tiers are different Uniswap V3 pools (0.01%, 0.05%, 0.3%, 1% fees).
 * This is NOT slippage -- slippage tolerance is handled at swap execution time.
 */
async function getUniswapQuote(params: QuoteParams): Promise<SwapQuote> {
  const providerName = SWAP_PROVIDERS.UNISWAP
  const route = resolveSwapRoute(params.tokenIn, params.tokenOut)
  const multihop = isMultihopRoute(route)

  if (multihop) {
    if (params.feeTier !== undefined && isValidUniswapFeeTier(params.feeTier)) {
      try {
        return await getMultihopQuoteExactInUniformTier(params, params.feeTier, route.tokens, providerName)
      } catch (err) {
        if (isTransportOrInfrastructureError(err)) {
          throw err
        }
        if (isLikelyQuoterContractRevert(err)) {
          return swapQuoteNoLiquidityExplicitTier(providerName, params.feeTier, 'uniform path')
        }
        throw err
      }
    }

    const bestQuote = await getBestMultihopQuoteExactIn(params, route.tokens, providerName)
    if (bestQuote) return bestQuote
    return {
      provider: providerName,
      amountOut: '0',
      amountOutRaw: '0',
      error: 'No liquidity available. All pool fee tiers failed to provide a quote.',
    }
  }

  if (params.feeTier !== undefined && isValidUniswapFeeTier(params.feeTier)) {
    try {
      return await getQuoteForSingleTier(params, params.feeTier, providerName)
    } catch (err) {
      if (isTransportOrInfrastructureError(err)) {
        throw err
      }
      if (isLikelyQuoterContractRevert(err)) {
        return swapQuoteNoLiquidityExplicitTier(providerName, params.feeTier, 'fee pool')
      }
      throw err
    }
  }

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
 * - Multihop + explicit fee: one `quoteExactOutput` with uniform fee on every hop.
 * - Multihop auto: multicall all per-hop fee combinations; lowest required amountIn wins.
 * - Single-hop explicit/auto: same as before.
 */
async function getUniswapExactOutputQuote(params: QuoteExactOutputParams): Promise<SwapQuote> {
  const providerName = SWAP_PROVIDERS.UNISWAP
  const route = resolveSwapRoute(params.tokenIn, params.tokenOut)
  const multihop = isMultihopRoute(route)

  if (multihop) {
    if (params.feeTier !== undefined && isValidUniswapFeeTier(params.feeTier)) {
      try {
        return await getMultihopQuoteExactOutUniformTier(params, params.feeTier, route.tokens, providerName)
      } catch (err) {
        if (isTransportOrInfrastructureError(err)) {
          throw err
        }
        if (isLikelyQuoterContractRevert(err)) {
          return swapQuoteNoLiquidityExplicitTier(providerName, params.feeTier, 'uniform path')
        }
        throw err
      }
    }

    const bestQuote = await getBestMultihopQuoteExactOut(params, route.tokens, providerName)
    if (bestQuote) return bestQuote
    return {
      provider: providerName,
      amountOut: '0',
      amountOutRaw: '0',
      error: 'No liquidity available. All pool fee tiers failed to provide a quote.',
    }
  }

  if (params.feeTier !== undefined && isValidUniswapFeeTier(params.feeTier)) {
    try {
      return await getExactOutputQuoteForSingleTier(params, params.feeTier, providerName)
    } catch (err) {
      if (isTransportOrInfrastructureError(err)) {
        throw err
      }
      if (isLikelyQuoterContractRevert(err)) {
        return swapQuoteNoLiquidityExplicitTier(providerName, params.feeTier, 'fee pool')
      }
      throw err
    }
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
  /** Used for single-hop paths; first-hop fee when `hopFees` is set. */
  poolFee: number
  recipient: Address
  /** Full per-hop fees for multihop; must match `resolveSwapRoute(tokenIn, tokenOut)`. */
  hopFees?: readonly number[]
}

/**
 * Encode the swap path for Uniswap V3 (single hop: tokenIn + fee + tokenOut).
 */
function encodeSingleHopSwapPath(tokenIn: Address, fee: number, tokenOut: Address): Hex {
  return encodeUniformFeeSwapPath([tokenIn, tokenOut], fee)
}

function encodeExecuteSwapPath(
  params: Pick<ExecuteSwapParams, 'tokenIn' | 'tokenOut' | 'poolFee' | 'hopFees'>,
): Hex {
  const { tokenIn, tokenOut, poolFee, hopFees } = params
  const route = resolveSwapRoute(tokenIn, tokenOut)
  if (hopFees && hopFees.length > 0) {
    if (hopFees.length !== route.tokens.length - 1) {
      throw new Error('hopFees length does not match resolved swap route')
    }
    return encodePerHopFeeSwapPath(route.tokens, hopFees)
  }
  return encodeSingleHopSwapPath(tokenIn, poolFee, tokenOut)
}

/**
 * Get encoded swap data for Universal Router
 * This is a synchronous helper that returns the encoded command and inputs
 */
export function getSwapEncodedData(params: ExecuteSwapParams): {
  commands: Hex
  inputs: [Hex]
} {
  const { tokenIn, tokenOut, amountIn, amountOutMinimum, poolFee, recipient, hopFees } = params

  const path = encodeExecuteSwapPath({ tokenIn, tokenOut, poolFee, hopFees })

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
  const { tokenIn, tokenOut, amountIn, amountOutMinimum, poolFee, recipient, hopFees, permit, signature } =
    params

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
          expiration: Number(permit.details.expiration),
          nonce: Number(permit.details.nonce),
        },
        spender: permit.spender,
        sigDeadline: permit.sigDeadline,
      },
      signature,
    ],
  )

  const path = encodeExecuteSwapPath({ tokenIn, tokenOut, poolFee, hopFees })
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

  const commands = '0x0a00' as Hex

  return {
    commands,
    inputs: [permitInput as Hex, swapInput as Hex],
  }
}

/**
 * Check which fee tiers are selectable for a token pair.
 * Single-hop: probe `quoteExactInputSingle` per tier.
 * Multihop: probe `quoteExactInput` with the same fee on every hop (uniform path); tiers that succeed are listed.
 * Returned tiers follow UNISWAP_FEE_TIERS order.
 */
export async function getAvailableFeeTiers(
  tokenIn: Address,
  tokenOut: Address,
  tokenInDecimals: number,
): Promise<UniswapFeeTier[]> {
  const route = resolveSwapRoute(tokenIn, tokenOut)
  const oneFullTokenRaw = 10n ** BigInt(tokenInDecimals)
  const maxProbeRaw = 10n ** 12n
  const testAmount = oneFullTokenRaw > maxProbeRaw ? maxProbeRaw : oneFullTokenRaw

  if (isMultihopRoute(route)) {
    const results = await multicallWithGasEnvelopeRetry(publicClient, {
      contracts: buildMultihopUniformFeeExactInputContracts(route.tokens, testAmount),
    })

    return results
      .map((result, index) => {
        if (result.status !== 'success' || !isValidQuotePathResult(result.result)) return null
        const [amountOut] = result.result
        if (amountOut <= 0n) return null
        return UNISWAP_FEE_TIERS[index]
      })
      .filter((fee): fee is UniswapFeeTier => fee !== null)
  }

  const results = await multicallWithGasEnvelopeRetry(publicClient, {
    contracts: buildExactInputContracts(tokenIn, tokenOut, testAmount),
  })

  return results
    .map((result, index) =>
      result.status === 'success' && isValidQuoteResult(result.result) ? UNISWAP_FEE_TIERS[index] : null,
    )
    .filter((fee): fee is UniswapFeeTier => fee !== null)
}

export const uniswapProvider: SwapProvider = {
  name: SWAP_PROVIDERS.UNISWAP,
  getQuote: getUniswapQuote,
  getQuoteExactOutput: getUniswapExactOutputQuote,
}

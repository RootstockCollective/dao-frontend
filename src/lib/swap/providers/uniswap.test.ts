import { describe, it, expect, beforeAll } from 'vitest'
import {
  decodeAbiParameters,
  encodeFunctionData,
  getAddress,
  parseUnits,
  type AbiFunction,
  type Address,
  type Hex,
} from 'viem'
import {
  uniswapProvider,
  getAvailableFeeTiers,
  getPermitSwapEncodedData,
  UNISWAP_FEE_TIERS,
  encodePerHopFeeSwapPath,
  encodeUniformFeeSwapPath,
} from './uniswap'
import type { PermitSingle } from '../permit2'
import { ROUTER_ADDRESSES, SWAP_TOKEN_ADDRESSES } from '../constants'
import { isMultihopRoute, resolveSwapRoute } from '../routes'
import { getTokenDecimals } from '../utils'
import { UniswapQuoterV2Abi } from '@/lib/abis/UniswapQuoterV2Abi'
import { tokenContracts } from '@/lib/contracts'
import { RIF, UNISWAP_UNIVERSAL_ROUTER_ADDRESS } from '@/lib/constants'
import { publicClient } from '@/lib/viemPublicClient'
import type { SwapQuote } from './'

/**
 * Integration tests against a Rootstock fork (Anvil + FORK_RPC_URL).
 * They assert real QuoterV2 + pool behavior, not mocks.
 *
 * Runtime behavior (see getUniswapQuote / getUniswapExactOutputQuote):
 * - Valid feeTier (100, 500, 3000, 10000): single readContract, no fallback.
 * - Invalid / omitted feeTier: multicall all tiers, best quote wins (exactIn: max amountOut; exactOut: min amountIn).
 */

const INVALID_TOKEN_IN = '0x0000000000000000000000000000000000000001' as const
const INVALID_TOKEN_OUT = '0x0000000000000000000000000000000000000002' as const

function sortFeeTiers(tiers: number[]) {
  return [...tiers].sort((a, b) => a - b)
}

function expectAutoExactInOk(result: SwapQuote) {
  expect(result.provider).toBe('uniswap')
  expect(result.error).toBeUndefined()
  expect(parseFloat(result.amountOut)).toBeGreaterThan(0)
  expect(UNISWAP_FEE_TIERS).toContain(result.feeTier)
}

function getTwoHopFeeCombinations(): number[][] {
  const hopCombos: number[][] = []
  for (const firstHopFee of UNISWAP_FEE_TIERS) {
    for (const secondHopFee of UNISWAP_FEE_TIERS) {
      hopCombos.push([firstHopFee, secondHopFee])
    }
  }
  return hopCombos
}

async function getBestMultihopExactInputFromMulticall(routeTokens: readonly Address[], amountIn: bigint) {
  const hopCombos = getTwoHopFeeCombinations()
  const multicall = await publicClient.multicall({
    contracts: hopCombos.map(hopFees => ({
      address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
      abi: UniswapQuoterV2Abi,
      functionName: 'quoteExactInput' as const,
      args: [encodePerHopFeeSwapPath(routeTokens, hopFees), amountIn] as const,
    })),
  })

  let bestOut = 0n
  let winningHops: readonly number[] | null = null
  multicall.forEach((row, index) => {
    if (row.status !== 'success' || !Array.isArray(row.result)) return
    const amountOut = row.result[0]
    if (typeof amountOut !== 'bigint') return
    if (amountOut > bestOut) {
      bestOut = amountOut
      winningHops = hopCombos[index]
    }
  })

  return { bestOut, winningHops }
}

/** Large permit budget for encoding-only tests; `amount` uses the bridged token's decimals (e.g. USDRIF/RIF). */
function mockPermitForTests(token: Address, tokenDecimals: number): PermitSingle {
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
  return {
    details: {
      token,
      amount: parseUnits('1000000', tokenDecimals),
      expiration: Number(deadline),
      nonce: 0,
    },
    spender: UNISWAP_UNIVERSAL_ROUTER_ADDRESS,
    sigDeadline: deadline,
  }
}

const MOCK_SIGNATURE = `0x${'00'.repeat(65)}` as Hex

describe('uniswap provider - integration tests', () => {
  const realTokenIn = SWAP_TOKEN_ADDRESSES.USDT0
  const realTokenOut = SWAP_TOKEN_ADDRESSES.USDRIF
  const rifToken = tokenContracts[RIF]
  const wrbtcToken = SWAP_TOKEN_ADDRESSES.WRBTC
  let tokenInDecimals: number
  let tokenOutDecimals: number
  let rifDecimals: number
  let wrbtcDecimals = 18

  const hasRealAddresses =
    ROUTER_ADDRESSES.UNISWAP_QUOTER_V2 &&
    ROUTER_ADDRESSES.UNISWAP_QUOTER_V2 !== '0x0000000000000000000000000000000000000000' &&
    realTokenIn &&
    realTokenOut

  const hasRifToken = hasRealAddresses && rifToken

  /** USDT0 → USDRIF exact-in (closure over fork env). */
  function quoteForwardIn(amountIn: bigint, feeTier?: number) {
    return uniswapProvider.getQuote({
      tokenIn: realTokenIn,
      tokenOut: realTokenOut,
      amountIn,
      tokenInDecimals,
      tokenOutDecimals,
      ...(feeTier !== undefined ? { feeTier } : {}),
    })
  }

  function quoteForwardOut(amountOut: bigint, feeTier?: number) {
    return uniswapProvider.getQuoteExactOutput!({
      tokenIn: realTokenIn,
      tokenOut: realTokenOut,
      amountOut,
      tokenInDecimals,
      tokenOutDecimals,
      ...(feeTier !== undefined ? { feeTier } : {}),
    })
  }

  function quoteInvalidPairExactIn(feeTier?: number) {
    return uniswapProvider.getQuote({
      tokenIn: INVALID_TOKEN_IN,
      tokenOut: INVALID_TOKEN_OUT,
      amountIn: 1_000_000n,
      tokenInDecimals: 18,
      tokenOutDecimals: 18,
      ...(feeTier !== undefined ? { feeTier } : {}),
    })
  }

  async function firstForwardLiquidityTier() {
    const tiers = await getAvailableFeeTiers(realTokenIn, realTokenOut, tokenInDecimals)
    expect(tiers.length).toBeGreaterThan(0)
    return tiers[0]
  }

  async function firstForwardTierWithoutLiquidity() {
    const available = await getAvailableFeeTiers(realTokenIn, realTokenOut, tokenInDecimals)
    return UNISWAP_FEE_TIERS.find(t => !available.includes(t))
  }

  const hasWrbbtcPair =
    Boolean(hasRifToken) &&
    wrbtcToken &&
    wrbtcToken !== '0x0000000000000000000000000000000000000000'

  beforeAll(async () => {
    if (hasRealAddresses) {
      try {
        tokenInDecimals = await getTokenDecimals(realTokenIn)
        tokenOutDecimals = await getTokenDecimals(realTokenOut)
        rifDecimals = await getTokenDecimals(rifToken)
        if (hasWrbbtcPair) {
          wrbtcDecimals = await getTokenDecimals(wrbtcToken)
        }
      } catch (error) {
        console.warn('Failed to fetch token decimals, some tests may be skipped:', error)
      }
    }
  })

  describe('getQuote (exact input)', () => {
    describe('auto mode — valid feeTier omitted; multicall all tiers, pick best amountOut', () => {
      it.skipIf(!hasRealAddresses)(
        'succeeds for USDT0 → USDRIF, returns valid feeTier and consistent formatted/raw amounts',
        { timeout: 25_000, retry: 2 },
        async () => {
          const amountIn = parseUnits('1', tokenInDecimals)
          const result = await quoteForwardIn(amountIn)

          expect(result.amountOut).not.toBe('0')
          expect(result.amountOutRaw).not.toBe('0')
          expect(BigInt(result.amountOutRaw)).toBeGreaterThan(0n)
          expectAutoExactInOk(result)

          expect(result.amountOut).toMatch(/^\d+(\.\d+)?$/)
          expect(result.amountOutRaw).toMatch(/^\d+$/)
          const expectedFormatted = Number(BigInt(result.amountOutRaw)) / 10 ** tokenOutDecimals
          expect(Math.abs(parseFloat(result.amountOut) - expectedFormatted)).toBeLessThan(0.000001)

          if (result.gasEstimate) {
            expect(parseInt(result.gasEstimate, 10)).toBeGreaterThan(0)
          }
        },
      )

      it.skipIf(!hasRealAddresses)(
        'same auto path works when amountIn is passed as raw bigint (1 USDT0 = 10^6 wei)',
        { timeout: 15_000 },
        async () => {
          expectAutoExactInOk(await quoteForwardIn(1_000_000n))
        },
      )
    })

    describe('single-hop: provider getQuote vs on-chain QuoterV2 (USDT0→USDRIF)', () => {
      /**
       * Cross-check `uniswapProvider.getQuote` against the same fork the tests use for
       * `publicClient.readContract` / `multicall` on Uniswap QuoterV2.
       *
       * - Explicit fee: one pool tier; expect `amountOutRaw` to equal QuoterV2
       *   `quoteExactInputSingle` (first return value), as a decimal string.
       * - Auto (no fee): provider multicalls tiers internally; expect the same best
       *   `amountOut` and `feeTier` as a manual multicall over every standard tier here.
       */
      it.skipIf(!hasRealAddresses)(
        'getQuote with explicit fee matches quoteExactInputSingle for USDT0→USDRIF',
        { timeout: 15_000, retry: 2 },
        async () => {
          const amountIn = parseUnits('1', tokenInDecimals)
          const available = await getAvailableFeeTiers(realTokenIn, realTokenOut, tokenInDecimals)
          expect(available.length).toBeGreaterThan(0)
          const fee = available[0]

          const onChain = (await publicClient.readContract({
            address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
            abi: UniswapQuoterV2Abi,
            functionName: 'quoteExactInputSingle',
            args: [
              {
                tokenIn: realTokenIn,
                tokenOut: realTokenOut,
                amountIn,
                fee,
                sqrtPriceLimitX96: 0n,
              },
            ],
          })) as [bigint, bigint, number, bigint]
          const amountOutOnChain = onChain[0]

          const result = await uniswapProvider.getQuote({
            tokenIn: realTokenIn,
            tokenOut: realTokenOut,
            amountIn,
            tokenInDecimals,
            tokenOutDecimals,
            feeTier: fee,
          })

          expect(result.error).toBeUndefined()
          expect(result.amountOutRaw).toBe(amountOutOnChain.toString())
        },
      )

      it.skipIf(!hasRealAddresses)(
        'getQuote auto mode matches best quoteExactInputSingle across tiers',
        { timeout: 30_000, retry: 2 },
        async () => {
          const amountIn = parseUnits('1', tokenInDecimals)
          const multicall = await publicClient.multicall({
            contracts: UNISWAP_FEE_TIERS.map(fee => ({
              address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
              abi: UniswapQuoterV2Abi,
              functionName: 'quoteExactInputSingle' as const,
              args: [
                {
                  tokenIn: realTokenIn,
                  tokenOut: realTokenOut,
                  amountIn,
                  fee,
                  sqrtPriceLimitX96: 0n,
                },
              ] as const,
            })),
          })

          type TierResult = { amountOut: bigint; fee: number }
          const ok: TierResult[] = []
          multicall.forEach((row, index) => {
            if (row.status !== 'success' || !Array.isArray(row.result)) return
            const amountOut = row.result[0]
            if (typeof amountOut !== 'bigint') return
            ok.push({ amountOut, fee: UNISWAP_FEE_TIERS[index] })
          })
          expect(ok.length).toBeGreaterThan(0)
          const best = ok.reduce((a, b) => (a.amountOut >= b.amountOut ? a : b))

          const result = await uniswapProvider.getQuote({
            tokenIn: realTokenIn,
            tokenOut: realTokenOut,
            amountIn,
            tokenInDecimals,
            tokenOutDecimals,
          })

          expect(result.error).toBeUndefined()
          expect(result.amountOutRaw).toBe(best.amountOut.toString())
          expect(result.feeTier).toBe(best.fee)
        },
      )
    })

    describe('multihop USDRIF↔RIF (via USDT0): quotes vs QuoterV2 and tier discovery', () => {
      /**
       * Route is two hops (e.g. USDRIF → USDT0 → RIF) from `resolveSwapRoute`.
       * Tests compare the provider to direct QuoterV2 reads and to a reference
       * multicall that scores every allowed per-hop fee combination.
       */
      it.skipIf(!hasRifToken)(
        'getAvailableFeeTiers lists only uniform-multihop tiers (same fee each hop); may be empty when only mixed-hop fees quote',
        { timeout: 15_000, retry: 2 },
        async () => {
          // tokenOutDecimals === USDRIF decimals here (realTokenOut is USDRIF); third arg is tokenInDecimals for USDRIF.
          const tiers = await getAvailableFeeTiers(SWAP_TOKEN_ADDRESSES.USDRIF, rifToken, tokenOutDecimals)
          expect(Array.isArray(tiers)).toBe(true)
          tiers.forEach(t => expect(UNISWAP_FEE_TIERS).toContain(t))
        },
      )

      it.skipIf(!hasRifToken)(
        'USDRIF→RIF multihop: when a uniform fee path exists, explicit tier matches quoteExactInput',
        { timeout: 30_000, retry: 2 },
        async () => {
          const tiers = await getAvailableFeeTiers(SWAP_TOKEN_ADDRESSES.USDRIF, rifToken, tokenOutDecimals)
          if (tiers.length === 0) return

          const tier = tiers[0]
          const route = resolveSwapRoute(SWAP_TOKEN_ADDRESSES.USDRIF, rifToken)
          const amountIn = parseUnits('1', tokenOutDecimals)
          const path = encodeUniformFeeSwapPath(route.tokens, tier)

          const rawDirect = await publicClient.readContract({
            address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
            abi: UniswapQuoterV2Abi,
            functionName: 'quoteExactInput',
            args: [path, amountIn],
          })
          expect(Array.isArray(rawDirect)).toBe(true)
          const expectedOut = (rawDirect as [bigint])[0]

          const result = await uniswapProvider.getQuote({
            tokenIn: SWAP_TOKEN_ADDRESSES.USDRIF,
            tokenOut: rifToken,
            amountIn,
            tokenInDecimals: tokenOutDecimals,
            tokenOutDecimals: rifDecimals,
            feeTier: tier,
          })

          expect(result.error).toBeUndefined()
          expect(result.amountOutRaw).toBe(expectedOut.toString())
          expect(result.hopFees).toEqual([tier, tier])
        },
      )

      it.skipIf(!hasRifToken)(
        'USDRIF→RIF multihop: auto mode matches best per-hop fee combination',
        { timeout: 45_000, retry: 2 },
        async () => {
          const route = resolveSwapRoute(SWAP_TOKEN_ADDRESSES.USDRIF, rifToken)
          expect(route.tokens.length).toBe(3)

          const amountIn = parseUnits('1', tokenOutDecimals)
          const { bestOut, winningHops } = await getBestMultihopExactInputFromMulticall(route.tokens, amountIn)

          expect(bestOut > 0n).toBe(true)

          const result = await uniswapProvider.getQuote({
            tokenIn: SWAP_TOKEN_ADDRESSES.USDRIF,
            tokenOut: rifToken,
            amountIn,
            tokenInDecimals: tokenOutDecimals,
            tokenOutDecimals: rifDecimals,
          })

          expect(result.error).toBeUndefined()
          expect(result.amountOutRaw).toBe(bestOut.toString())
          expect(result.hopFees).toEqual(winningHops)
        },
      )

      it.skipIf(!hasRifToken)(
        'RIF→USDRIF multihop: auto mode matches best per-hop multicall',
        { timeout: 45_000, retry: 2 },
        async () => {
          const route = resolveSwapRoute(rifToken, SWAP_TOKEN_ADDRESSES.USDRIF)
          const amountIn = parseUnits('0.5', rifDecimals)
          const { bestOut, winningHops } = await getBestMultihopExactInputFromMulticall(route.tokens, amountIn)

          expect(bestOut > 0n).toBe(true)

          const result = await uniswapProvider.getQuote({
            tokenIn: rifToken,
            tokenOut: SWAP_TOKEN_ADDRESSES.USDRIF,
            amountIn,
            tokenInDecimals: rifDecimals,
            tokenOutDecimals: tokenOutDecimals,
          })

          expect(result.error).toBeUndefined()
          expect(result.amountOutRaw).toBe(bestOut.toString())
          expect(result.hopFees).toEqual(winningHops)
        },
      )
    })

    describe('invalid explicit feeTier — not in [100,500,3000,10000]; treated like auto mode', () => {
      it.skipIf(!hasRealAddresses)(
        'feeTier 200 is ignored; multicall auto still returns a quote',
        { timeout: 15_000 },
        async () => {
          expectAutoExactInOk(await quoteForwardIn(parseUnits('1', tokenInDecimals), 200))
        },
      )
    })

    describe('explicit valid feeTier — single pool quote only (matches swap path when user picks a pool)', () => {
      it.skipIf(!hasRealAddresses)(
        'uses only the requested tier when it has liquidity',
        { timeout: 15_000 },
        async () => {
          const tier = await firstForwardLiquidityTier()
          const result = await quoteForwardIn(parseUnits('1', tokenInDecimals), tier)
          expect(result.error).toBeUndefined()
          expect(result.feeTier).toBe(tier)
          expect(parseFloat(result.amountOut)).toBeGreaterThan(0)
        },
      )

      it.skipIf(!hasRealAddresses)(
        'no fallback: failing tier returns error on that tier only',
        { timeout: 15_000 },
        async () => {
          const badTier = await firstForwardTierWithoutLiquidity()
          if (!badTier) return

          const result = await quoteForwardIn(parseUnits('1', tokenInDecimals), badTier)
          expect(result.error).toBeDefined()
          expect(result.amountOut).toBe('0')
          expect(result.feeTier).toBe(badTier)
          expect(result.error).toContain('No liquidity available')
        },
      )
    })

    describe('no pool / bad tokens — auto mode returns aggregate error', () => {
      it.skipIf(!hasRealAddresses)(
        'invalid token addresses → structured error after all tiers fail',
        { timeout: 30_000 },
        async () => {
          const result = await quoteInvalidPairExactIn(3000)
          expect(result.provider).toBe('uniswap')
          expect(result.error).toBeDefined()
          expect(result.amountOut).toBe('0')
          expect(typeof result.error).toBe('string')
          expect(result.error!.length).toBeGreaterThan(0)
        },
      )

      it.skipIf(!hasRealAddresses)(
        'invalid tokens without explicit tier: same aggregate error',
        { timeout: 30_000 },
        async () => {
          const result = await quoteInvalidPairExactIn()
          expect(result.error).toBeDefined()
          expect(result.error).toContain('No liquidity available')
          expect(result.amountOut).toBe('0')
        },
      )
    })

    describe('reverse direction USDRIF → USDT0', () => {
      it.skipIf(!hasRealAddresses)(
        'finds a quoting tier for 1 USDRIF (probe may differ from full-token quote per tier)',
        { timeout: 60_000, retry: 2 },
        async () => {
          const amountIn = parseUnits('1', tokenOutDecimals)
          const reverseTiers = await getAvailableFeeTiers(realTokenOut, realTokenIn, tokenOutDecimals)
          expect(reverseTiers.length).toBeGreaterThan(0)

          let result: SwapQuote | undefined
          for (const tier of reverseTiers) {
            const r = await uniswapProvider.getQuote({
              tokenIn: realTokenOut,
              tokenOut: realTokenIn,
              amountIn,
              tokenInDecimals: tokenOutDecimals,
              tokenOutDecimals: tokenInDecimals,
              feeTier: tier,
            })
            if (!r.error) {
              result = r
              break
            }
          }

          expect(result).toBeDefined()
          expect(result!.error).toBeUndefined()
          expect(parseFloat(result!.amountOut)).toBeGreaterThan(0)
          expect(reverseTiers).toContain(result!.feeTier)
        },
      )
    })

    describe('optional pair: RIF → USDT0 (may or may not have direct pool)', () => {
      it.skipIf(!hasRifToken)(
        'either error after all tiers, or a valid quote with feeTier',
        { timeout: 30_000 },
        async () => {
          const result = await uniswapProvider.getQuote({
            tokenIn: rifToken,
            tokenOut: realTokenIn,
            amountIn: parseUnits('100', rifDecimals),
            tokenInDecimals: rifDecimals,
            tokenOutDecimals: tokenInDecimals,
          })

          if (result.error) {
            expect(result.provider).toBe('uniswap')
            expect(result.error).toContain('No liquidity available')
            expect(result.amountOut).toBe('0')
          } else {
            expect(result.amountOut).not.toBe('0')
            expect(result.feeTier).toBeDefined()
            expect(UNISWAP_FEE_TIERS).toContain(result.feeTier)
          }
        },
      )
    })

    describe('RIF↔WRBTC quotes (DAO-2085)', () => {
      it.skipIf(!hasWrbbtcPair)('resolveSwapRoute uses one hop on mainnet/fork for RIF→WRBTC', () => {
        const route = resolveSwapRoute(rifToken, wrbtcToken)
        expect(route.tokens).toHaveLength(2)
        expect(isMultihopRoute(route)).toBe(false)
      })

      it.skipIf(!hasWrbbtcPair)(
        'getQuote auto mode succeeds for RIF→WRBTC',
        async () => {
          const amountIn = parseUnits('0.1', rifDecimals)
          const result = await uniswapProvider.getQuote({
            tokenIn: rifToken,
            tokenOut: wrbtcToken,
            amountIn,
            tokenInDecimals: rifDecimals,
            tokenOutDecimals: wrbtcDecimals,
          })
          expect(result.error).toBeUndefined()
          expect(result.amountOutRaw).not.toBe('0')
          expect(BigInt(result.amountOutRaw)).toBeGreaterThan(0n)
        },
        30_000,
      )

      it.skipIf(!hasWrbbtcPair)(
        'getQuote auto mode succeeds for WRBTC→RIF',
        async () => {
          const amountIn = parseUnits('0.0001', wrbtcDecimals)
          const result = await uniswapProvider.getQuote({
            tokenIn: wrbtcToken,
            tokenOut: rifToken,
            amountIn,
            tokenInDecimals: wrbtcDecimals,
            tokenOutDecimals: rifDecimals,
          })
          expect(result.error).toBeUndefined()
          expect(result.amountOutRaw).not.toBe('0')
          expect(BigInt(result.amountOutRaw)).toBeGreaterThan(0n)
        },
        30_000,
      )

      it.skipIf(!hasWrbbtcPair)(
        'getQuote with explicit fee matches quoteExactInputSingle for RIF→WRBTC',
        async () => {
          const available = await getAvailableFeeTiers(rifToken, wrbtcToken, rifDecimals)
          expect(available.length).toBeGreaterThan(0)
          const fee = available[0]
          const amountIn = parseUnits('0.05', rifDecimals)

          const onChain = (await publicClient.readContract({
            address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
            abi: UniswapQuoterV2Abi,
            functionName: 'quoteExactInputSingle',
            args: [
              {
                tokenIn: rifToken,
                tokenOut: wrbtcToken,
                amountIn,
                fee,
                sqrtPriceLimitX96: 0n,
              },
            ],
          })) as [bigint, bigint, number, bigint]
          const amountOutOnChain = onChain[0]

          const result = await uniswapProvider.getQuote({
            tokenIn: rifToken,
            tokenOut: wrbtcToken,
            amountIn,
            tokenInDecimals: rifDecimals,
            tokenOutDecimals: wrbtcDecimals,
            feeTier: fee,
          })

          expect(result.error).toBeUndefined()
          expect(result.amountOutRaw).toBe(amountOutOnChain.toString())
        },
        30_000,
      )

      it.skipIf(!hasRealAddresses)(
        'regression: USDT0→USDRIF direct route unchanged (single-hop topology)',
        () => {
          const route = resolveSwapRoute(realTokenIn, realTokenOut)
          expect(route.tokens).toEqual([getAddress(realTokenIn), getAddress(realTokenOut)])
          expect(isMultihopRoute(route)).toBe(false)
        },
      )

      it.skipIf(!hasRifToken)(
        'regression: USDRIF→RIF remains three-token bridge via USDT0',
        () => {
          const route = resolveSwapRoute(SWAP_TOKEN_ADDRESSES.USDRIF, rifToken)
          expect(route.tokens).toHaveLength(3)
          expect(route.tokens[1]).toBe(getAddress(realTokenIn))
        },
      )
    })
  })

  describe('getQuoteExactOutput (exact output)', () => {
    describe('auto mode', () => {
      it.skipIf(!hasRealAddresses)(
        'returns positive amountInRaw for 1 USDRIF out (USDT0 in)',
        { timeout: 15_000 },
        async () => {
          const amountOut = parseUnits('1', tokenOutDecimals)
          const result = await quoteForwardOut(amountOut)

          expect(result.provider).toBe('uniswap')
          expect(result.error).toBeUndefined()
          expect(result.amountInRaw).toBeDefined()
          const amountInBigInt = BigInt(result.amountInRaw!)
          expect(amountInBigInt).toBeGreaterThan(0n)
          expect(amountInBigInt).toBeGreaterThanOrEqual(500_000n)
          expect(amountInBigInt).toBeLessThanOrEqual(2_000_000n)
          expect(UNISWAP_FEE_TIERS).toContain(result.feeTier)
        },
      )
    })

    describe('invalid feeTier treated as auto (same as exact input)', () => {
      it.skipIf(!hasRealAddresses)(
        'feeTier 200 ignored; exact-out multicall still succeeds',
        { timeout: 15_000 },
        async () => {
          const result = await quoteForwardOut(parseUnits('1', tokenOutDecimals), 200)
          expect(result.error).toBeUndefined()
          expect(BigInt(result.amountInRaw!)).toBeGreaterThan(0n)
          expect(UNISWAP_FEE_TIERS).toContain(result.feeTier)
        },
      )
    })

    describe('explicit valid feeTier', () => {
      it.skipIf(!hasRealAddresses)(
        'uses only the requested tier when it supports this exact-out size',
        { timeout: 15_000 },
        async () => {
          const tier = await firstForwardLiquidityTier()
          const result = await quoteForwardOut(parseUnits('1', tokenOutDecimals), tier)
          expect(result.error).toBeUndefined()
          expect(result.feeTier).toBe(tier)
          expect(BigInt(result.amountInRaw!)).toBeGreaterThan(0n)
        },
      )
    })

    describe('bad tokens', () => {
      it.skipIf(!hasRealAddresses)(
        'returns error string, not throw',
        { timeout: 15_000 },
        async () => {
          const result = await uniswapProvider.getQuoteExactOutput!({
            tokenIn: INVALID_TOKEN_IN,
            tokenOut: INVALID_TOKEN_OUT,
            amountOut: 1_000_000n,
            tokenInDecimals: 18,
            tokenOutDecimals: 18,
          })
          expect(result.provider).toBe('uniswap')
          expect(result.error).toBeDefined()
          expect(typeof result.error).toBe('string')
          expect(result.error!.length).toBeGreaterThan(0)
        },
      )
    })
  })

  describe('getAvailableFeeTiers (pool discovery probe)', () => {
    it.skipIf(!hasRealAddresses)(
      'returns non-empty subset of UNISWAP_FEE_TIERS for USDT0/USDRIF forward',
      { timeout: 15_000 },
      async () => {
        const result = await getAvailableFeeTiers(realTokenIn, realTokenOut, tokenInDecimals)
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        result.forEach(tier => expect(UNISWAP_FEE_TIERS).toContain(tier))
      },
    )

    it.skipIf(!hasRealAddresses)(
      'forward and reverse directions return the same tier set (same pools, both ways)',
      { timeout: 45_000, retry: 2 },
      async () => {
        const forward = await getAvailableFeeTiers(realTokenIn, realTokenOut, tokenInDecimals)
        const reverse = await getAvailableFeeTiers(realTokenOut, realTokenIn, tokenOutDecimals)
        expect(sortFeeTiers(forward)).toEqual(sortFeeTiers(reverse))
      },
    )

    it.skipIf(!hasRealAddresses)(
      'junk pair returns empty array',
      { timeout: 15_000 },
      async () => {
        const result = await getAvailableFeeTiers(INVALID_TOKEN_IN, INVALID_TOKEN_OUT, 18)
        expect(result).toEqual([])
      },
    )
  })

  describe('ABI matches QuoterV2 (static + one live quote)', () => {
    it.skipIf(!hasRealAddresses)(
      'quoteExactInputSingle shape and encodeFunctionData succeed',
      { timeout: 15_000 },
      async () => {
        const quoteFunction = UniswapQuoterV2Abi.find(
          (item): item is AbiFunction => item.type === 'function' && item.name === 'quoteExactInputSingle',
        )
        expect(quoteFunction?.name).toBe('quoteExactInputSingle')
        expect(quoteFunction?.stateMutability).toBe('view')
        expect(quoteFunction?.inputs?.[0]?.type).toBe('tuple')
        expect(quoteFunction?.outputs?.length).toBe(4)

        const amountIn = parseUnits('1', tokenInDecimals)
        const encoded = encodeFunctionData({
          abi: UniswapQuoterV2Abi,
          functionName: 'quoteExactInputSingle',
          args: [
            {
              tokenIn: realTokenIn,
              tokenOut: realTokenOut,
              amountIn,
              fee: 100,
              sqrtPriceLimitX96: 0n,
            },
          ],
        })
        expect(encoded.startsWith('0x')).toBe(true)

        expectAutoExactInOk(await quoteForwardIn(amountIn))
      },
    )
  })

  describe('provider shape', () => {
    it('exposes name and getQuote', () => {
      expect(uniswapProvider.name).toBe('uniswap')
      expect(typeof uniswapProvider.getQuote).toBe('function')
      expect(typeof uniswapProvider.getQuoteExactOutput).toBe('function')
    })
  })

  /**
   * Universal Router swap payload uses the same V3 path bytes as `quoteExactInput`
   * (first address = tokenIn). Wallet `execute` is not asserted here (needs valid permit + funded account);
   * encoding agreement with the Quoter is the fork-safe guarantee.
   */
  describe('multihop execution encoding', () => {
    const testRecipient = '0x000000000000000000000000000000000000dEaD' as Address

    const swapInputTuple = [
      { name: 'recipient', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMinimum', type: 'uint256' },
      { name: 'path', type: 'bytes' },
      { name: 'payerIsUser', type: 'bool' },
    ] as const

    async function assertPermitBundlePathMatchesQuoter(params: {
      caseLabel: string
      tokenIn: Address
      tokenOut: Address
      tokenInDecimals: number
      tokenOutDecimals: number
      amountIn: bigint
    }) {
      const { caseLabel, tokenIn, tokenOut, tokenInDecimals, tokenOutDecimals, amountIn } = params

      const result = await uniswapProvider.getQuote({
        tokenIn,
        tokenOut,
        amountIn,
        tokenInDecimals,
        tokenOutDecimals,
      })

      expect(
        result.error,
        `${caseLabel}: multihop quote failed — ${result.error ?? 'unknown'}`,
      ).toBeUndefined()
      expect(result.hopFees?.length, `${caseLabel}: expected hopFees on multihop quote`).toBeGreaterThan(0)

      const hopFees = result.hopFees as readonly number[]
      const route = resolveSwapRoute(tokenIn, tokenOut)
      const expectedPath = encodePerHopFeeSwapPath(route.tokens, hopFees)

      const chainQuote = await publicClient.readContract({
        address: ROUTER_ADDRESSES.UNISWAP_QUOTER_V2,
        abi: UniswapQuoterV2Abi,
        functionName: 'quoteExactInput',
        args: [expectedPath, amountIn],
      })
      const amountOutOnChain = (chainQuote as [bigint, bigint[], number[], bigint])[0]
      expect(result.amountOutRaw).toBe(amountOutOnChain.toString())

      const minOut =
        amountOutOnChain > 10n ? (amountOutOnChain * 99n) / 100n : amountOutOnChain > 0n ? 1n : 0n
      expect(minOut > 0n).toBe(true)

      const { commands, inputs } = getPermitSwapEncodedData({
        tokenIn,
        tokenOut,
        amountIn,
        amountOutMinimum: minOut,
        poolFee: hopFees[0],
        hopFees,
        recipient: testRecipient,
        permit: mockPermitForTests(tokenIn, tokenInDecimals),
        signature: MOCK_SIGNATURE,
      })

      expect(commands).toBe('0x0a00')
      const decoded = decodeAbiParameters([...swapInputTuple], inputs[1])
      const pathHex = decoded[3] as Hex
      expect(pathHex.toLowerCase()).toBe(expectedPath.toLowerCase())
      expect(pathHex.slice(2, 42).toLowerCase()).toBe(tokenIn.slice(2).toLowerCase())
    }

    it.skipIf(!hasRifToken)(
      'USDRIF→RIF: permit2+swap bundle path matches Quoter and starts with tokenIn',
      async () => {
        await assertPermitBundlePathMatchesQuoter({
          caseLabel: 'USDRIF→RIF',
          tokenIn: SWAP_TOKEN_ADDRESSES.USDRIF,
          tokenOut: rifToken,
          tokenInDecimals: tokenOutDecimals,
          tokenOutDecimals: rifDecimals,
          amountIn: parseUnits('0.05', tokenOutDecimals),
        })
      },
      45000,
    )

    it.skipIf(!hasRifToken)(
      'RIF→USDRIF: permit2+swap bundle path matches Quoter and starts with tokenIn',
      async () => {
        await assertPermitBundlePathMatchesQuoter({
          caseLabel: 'RIF→USDRIF',
          tokenIn: rifToken,
          tokenOut: SWAP_TOKEN_ADDRESSES.USDRIF,
          tokenInDecimals: rifDecimals,
          tokenOutDecimals: tokenOutDecimals,
          amountIn: parseUnits('0.25', rifDecimals),
        })
      },
      45000,
    )
  })
})

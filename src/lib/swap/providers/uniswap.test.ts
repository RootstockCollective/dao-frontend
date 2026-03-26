import { describe, it, expect, beforeAll } from 'vitest'
import { parseUnits, encodeFunctionData, type AbiFunction, type Address } from 'viem'
import {
  uniswapProvider,
  getAvailableFeeTiers,
  UNISWAP_FEE_TIERS,
  encodePerHopFeeSwapPath,
  encodeUniformFeeSwapPath,
} from './uniswap'
import { ROUTER_ADDRESSES, SWAP_TOKEN_ADDRESSES } from '../constants'
import { resolveSwapRoute } from '../routes'
import { getTokenDecimals } from '../utils'
import { UniswapQuoterV2Abi } from '@/lib/abis/UniswapQuoterV2Abi'
import { tokenContracts } from '@/lib/contracts'
import { RIF } from '@/lib/constants'
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

describe('uniswap provider - integration tests', () => {
  const realTokenIn = SWAP_TOKEN_ADDRESSES.USDT0
  const realTokenOut = SWAP_TOKEN_ADDRESSES.USDRIF
  const rifToken = tokenContracts[RIF]
  let tokenInDecimals: number
  let tokenOutDecimals: number
  let rifDecimals: number

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

  beforeAll(async () => {
    if (hasRealAddresses) {
      try {
        tokenInDecimals = await getTokenDecimals(realTokenIn)
        tokenOutDecimals = await getTokenDecimals(realTokenOut)
        rifDecimals = await getTokenDecimals(rifToken)
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

    describe('single-hop regression vs QuoterV2 (STORY-006 Phase 1)', () => {
    /**
     * AC-2 / plan: app quote matches same-chain quote within ≤ 1 wei (exact match on raw uint256).
     */
    it.skipIf(!hasRealAddresses)(
      'getQuote with explicit fee matches quoteExactInputSingle for USDT0→USDRIF',
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
      15000,
    )

    it.skipIf(!hasRealAddresses)(
      'getQuote auto mode matches best quoteExactInputSingle across tiers',
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
      30000,
    )
  })

  describe('USDRIF↔RIF multihop quotes (STORY-006 Phase 1)', () => {
    it.skipIf(!hasRifToken)(
      'getAvailableFeeTiers returns uniform-path tiers for USDRIF↔RIF multihop',
      async () => {
        const tiers = await getAvailableFeeTiers(
          SWAP_TOKEN_ADDRESSES.USDRIF,
          rifToken,
          tokenOutDecimals,
        )
        expect(Array.isArray(tiers)).toBe(true)
        tiers.forEach(t => expect(UNISWAP_FEE_TIERS).toContain(t))
      },
      15000,
    )

    it.skipIf(!hasRifToken)(
      'getQuote with explicit fee matches quoteExactInput on uniform multihop path',
      async () => {
        const tiers = await getAvailableFeeTiers(
          SWAP_TOKEN_ADDRESSES.USDRIF,
          rifToken,
          tokenOutDecimals,
        )
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
      30000,
    )

    it.skipIf(!hasRifToken)(
      'getQuote picks best output over all standard per-hop fee pairs',
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
      45000,
    )

    it.skipIf(!hasRifToken)(
      'reverse direction RIF→USDRIF matches best per-hop multicall',
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
      45000,
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
          (item): item is AbiFunction =>
            item.type === 'function' && item.name === 'quoteExactInputSingle',
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
})

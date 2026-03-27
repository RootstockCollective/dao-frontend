import { describe, it, expect } from 'vitest'
import { getAddress } from 'viem'

import { RIF } from '@/lib/constants'
import { tokenContracts } from '@/lib/contracts'

import { SWAP_TOKEN_ADDRESSES } from './constants'
import { getSwapRouteCacheKey, isMultihopRoute, resolveSwapRoute } from './routes'
import { encodeUniformFeeSwapPath } from './providers/uniswap'

describe('resolveSwapRoute', () => {
  const usdt0 = getAddress(SWAP_TOKEN_ADDRESSES.USDT0)
  const usdrif = getAddress(SWAP_TOKEN_ADDRESSES.USDRIF)
  const rif = getAddress(tokenContracts[RIF])

  it('returns USDRIF → USDT0 → RIF for USDRIF to RIF', () => {
    const route = resolveSwapRoute(usdrif, rif)
    expect(route.tokens).toEqual([usdrif, usdt0, rif])
    expect(isMultihopRoute(route)).toBe(true)
  })

  it('returns RIF → USDT0 → USDRIF for RIF to USDRIF', () => {
    const route = resolveSwapRoute(rif, usdrif)
    expect(route.tokens).toEqual([rif, usdt0, usdrif])
    expect(isMultihopRoute(route)).toBe(true)
  })

  it('returns a direct path for USDT0 to USDRIF', () => {
    const route = resolveSwapRoute(usdt0, usdrif)
    expect(route.tokens).toEqual([usdt0, usdrif])
    expect(isMultihopRoute(route)).toBe(false)
  })

  it('returns a direct path for USDT0 to RIF (stablecoin leg, not USDRIF↔RIF bridge)', () => {
    const route = resolveSwapRoute(usdt0, rif)
    expect(route.tokens).toEqual([usdt0, rif])
    expect(isMultihopRoute(route)).toBe(false)
  })

  it('returns a direct path for USDRIF to USDT0', () => {
    const route = resolveSwapRoute(usdrif, usdt0)
    expect(route.tokens).toEqual([usdrif, usdt0])
    expect(isMultihopRoute(route)).toBe(false)
  })

  it('returns a direct path for unknown pairs (no bridge table)', () => {
    const a = '0x0000000000000000000000000000000000000001' as const
    const b = '0x0000000000000000000000000000000000000002' as const
    const route = resolveSwapRoute(a, b)
    expect(route.tokens).toEqual([getAddress(a), getAddress(b)])
    expect(isMultihopRoute(route)).toBe(false)
  })

  it('getSwapRouteCacheKey is stable for direction (USDRIF↔RIF)', () => {
    const forward = getSwapRouteCacheKey(usdrif, rif)
    const reverse = getSwapRouteCacheKey(rif, usdrif)
    expect(forward).not.toBe(reverse)
    expect(forward.split(':')).toHaveLength(3)
    expect(reverse.split(':')).toHaveLength(3)
  })
})

describe('encodeUniformFeeSwapPath', () => {
  it('matches legacy single-hop layout (43 bytes)', () => {
    const tokenIn = '0x1111111111111111111111111111111111111111' as const
    const tokenOut = '0x2222222222222222222222222222222222222222' as const
    const path = encodeUniformFeeSwapPath([tokenIn, tokenOut], 100)
    // 20 + 3 + 20 bytes → 86 hex digits + 0x
    expect(path.length).toBe(2 + 86)
    expect(path.startsWith('0x')).toBe(true)
  })

  it('builds a two-hop path (66 bytes)', () => {
    const a = '0x1111111111111111111111111111111111111111' as const
    const b = '0x2222222222222222222222222222222222222222' as const
    const c = '0x3333333333333333333333333333333333333333' as const
    const path = encodeUniformFeeSwapPath([a, b, c], 3000)
    expect(path.length).toBe(2 + 132)
  })
})

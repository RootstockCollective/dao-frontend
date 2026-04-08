import { type Address, getAddress } from 'viem'

import { RIF, WRBTC_ADDRESS } from '@/lib/constants'
import { tokenContracts } from '@/lib/contracts'

import { SWAP_TOKEN_ADDRESSES } from './constants'

/**
 * Resolved swap topology: token sequence only (Uniswap V3 path without fee slots).
 * Fees are chosen at quote time per hop (see Uniswap provider multihop quoting).
 */
export interface SwapRoute {
  readonly tokens: readonly Address[]
}

/**
 * Resolve the canonical token path for a swap.
 * USDRIF↔RIF uses a fixed two-hop bridge via USDT0 (product topology, not an ENV switch).
 * RIF↔WRBTC uses a direct single hop like other native DEX pairs; pools exist on the deployed chain (mainnet / fork). If a network has no pool, the quoter fails—same as any missing pool.
 * All other pairs default to a direct path.
 * Addresses are normalized with {@link getAddress} for stable comparisons.
 */
export function resolveSwapRoute(tokenIn: Address, tokenOut: Address): SwapRoute {
  const a = getAddress(tokenIn)
  const b = getAddress(tokenOut)

  const usdt0 = getAddress(SWAP_TOKEN_ADDRESSES.USDT0)
  const usdrif = getAddress(SWAP_TOKEN_ADDRESSES.USDRIF)
  const rif = getAddress(tokenContracts[RIF])
  const wrbtc = getAddress(WRBTC_ADDRESS)

  const isUsdrifRifPair = (a === usdrif && b === rif) || (a === rif && b === usdrif)
  if (isUsdrifRifPair) {
    if (a === usdrif) {
      return { tokens: [usdrif, usdt0, rif] }
    }
    return { tokens: [rif, usdt0, usdrif] }
  }

  const isRifWrbbtcPair = (a === rif && b === wrbtc) || (a === wrbtc && b === rif)
  if (isRifWrbbtcPair) {
    return a === rif ? { tokens: [rif, wrbtc] } : { tokens: [wrbtc, rif] }
  }

  return { tokens: [a, b] }
}

/** True when the route requires a multi-segment V3 path (more than one hop). */
export function isMultihopRoute(route: SwapRoute): boolean {
  return route.tokens.length > 2
}

/** Stable key for React Query (checksum addresses in path order). */
export function getSwapRouteCacheKey(tokenIn: Address, tokenOut: Address): string {
  return resolveSwapRoute(tokenIn, tokenOut).tokens.join(':')
}

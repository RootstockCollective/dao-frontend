import { type Address, getAddress } from 'viem'

import { RIF } from '@/lib/constants'
import { tokenContracts } from '@/lib/contracts'

import { SWAP_TOKEN_ADDRESSES } from './constants'

/**
 * Resolved swap topology: token sequence only (Uniswap V3 path without fee slots).
 * Fees are chosen at quote time as one uniform uint24 tier repeated for every hop.
 */
export interface SwapRoute {
  readonly tokens: readonly Address[]
}

/**
 * Resolve the canonical token path for a swap.
 * USDRIF↔RIF uses a fixed two-hop bridge via USDT0; all other pairs default to a direct path.
 * Addresses are normalized with {@link getAddress} for stable comparisons.
 */
export function resolveSwapRoute(tokenIn: Address, tokenOut: Address): SwapRoute {
  const a = getAddress(tokenIn)
  const b = getAddress(tokenOut)

  const usdt0 = getAddress(SWAP_TOKEN_ADDRESSES.USDT0)
  const usdrif = getAddress(SWAP_TOKEN_ADDRESSES.USDRIF)
  const rif = getAddress(tokenContracts[RIF])

  const isUsdrifRifPair = (a === usdrif && b === rif) || (a === rif && b === usdrif)
  if (isUsdrifRifPair) {
    if (a === usdrif) {
      return { tokens: [usdrif, usdt0, rif] }
    }
    return { tokens: [rif, usdt0, usdrif] }
  }

  return { tokens: [a, b] }
}

/** True when the route requires a multi-segment V3 path (more than one hop). */
export function isMultihopRoute(route: SwapRoute): boolean {
  return route.tokens.length > 2
}

'use client'

import { useMemo } from 'react'
import { Address } from 'viem'
import { USDT0, USDRIF, USDT0_ADDRESS, USDRIF_ADDRESS } from '@/lib/constants'
import { getSymbolDecimals } from '@/app/shared/formatter'
import type { SwapTokenSymbol } from './types'

/**
 * Token information for swapping
 */
export interface SwapToken {
  symbol: SwapTokenSymbol
  address: Address
  name: string
  decimals: number
}

/**
 * Hook to get swap token metadata.
 *
 * Uses static decimals from getSymbolDecimals utility since token decimals
 * are immutable once deployed.
 *
 * TODO: Consider fetching decimals once per session and caching if we want
 * runtime verification, but this is low priority since decimals never change.
 */
export const useSwapTokens = () => {
  const tokens = useMemo(
    (): Record<SwapTokenSymbol, SwapToken> => ({
      [USDT0]: {
        symbol: USDT0,
        address: USDT0_ADDRESS,
        name: USDT0,
        decimals: getSymbolDecimals(USDT0),
      },
      [USDRIF]: {
        symbol: USDRIF,
        address: USDRIF_ADDRESS,
        name: USDRIF,
        decimals: getSymbolDecimals(USDRIF),
      },
    }),
    [],
  )

  return { tokens }
}

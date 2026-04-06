'use client'

import { useMemo } from 'react'
import { Address } from 'viem'

import { getSymbolDecimals } from '@/app/shared/formatter'
import {
  RIF,
  RIF_ADDRESS,
  USDRIF,
  USDRIF_ADDRESS,
  USDT0,
  USDT0_ADDRESS,
  WRBTC,
  WRBTC_ADDRESS,
} from '@/lib/constants'

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
      [RIF]: {
        symbol: RIF,
        address: RIF_ADDRESS,
        name: RIF,
        decimals: getSymbolDecimals(RIF),
      },
      [WRBTC]: {
        symbol: WRBTC,
        address: WRBTC_ADDRESS,
        name: WRBTC,
        decimals: getSymbolDecimals(WRBTC),
      },
    }),
    [],
  )

  return { tokens }
}

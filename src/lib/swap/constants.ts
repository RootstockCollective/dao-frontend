import {
  ICECREAMSWAP_ROUTER_ADDRESS,
  RIF,
  UNISWAP_QUOTER_V2_ADDRESS,
  UNISWAP_UNIVERSAL_ROUTER_ADDRESS,
  USDRIF,
  USDT0,
  USDT0_USDRIF_POOL_ADDRESS,
} from '@/lib/constants'
import { tokenContracts } from '@/lib/contracts'

/**
 * Token addresses for swap operations
 * Imported from centralized token contracts configuration
 */
export const SWAP_TOKEN_ADDRESSES = {
  USDT0: tokenContracts[USDT0],
  USDRIF: tokenContracts[USDRIF],
  RIF: tokenContracts[RIF],
} as const

/** Symbols exposed in the in-app swap flow (fixed triple: stablecoin + derivatives + RIF). */
export const SWAP_FLOW_TOKEN_SYMBOLS = [USDT0, USDRIF, RIF] as const

/**
 * DEX Router Contract Addresses
 * Imported from constants (which reads from env variables with fallbacks)
 */
export const ROUTER_ADDRESSES = {
  UNISWAP_UNIVERSAL_ROUTER: UNISWAP_UNIVERSAL_ROUTER_ADDRESS,
  UNISWAP_QUOTER_V2: UNISWAP_QUOTER_V2_ADDRESS,
  ICECREAMSWAP_ROUTER: ICECREAMSWAP_ROUTER_ADDRESS,
} as const

/**
 * Pool Addresses
 * Imported from constants (which reads from env variables with fallbacks)
 */
export const POOL_ADDRESSES = {
  USDT0_USDRIF_POOL: USDT0_USDRIF_POOL_ADDRESS,
} as const

/**
 * Provider Names
 */
export const SWAP_PROVIDERS = {
  UNISWAP: 'uniswap',
  ICECREAMSWAP: 'icecreamswap',
  OPENOCEAN: 'openocean',
} as const

export type SwapProviderName = (typeof SWAP_PROVIDERS)[keyof typeof SWAP_PROVIDERS]

/**
 * Uniswap V3 pool fee tiers (basis points). Single source of truth for provider + UI.
 */
export const UNISWAP_FEE_TIERS = [100, 500, 3000, 10000] as const

export type UniswapFeeTier = (typeof UNISWAP_FEE_TIERS)[number]

/**
 * Convert a Uniswap V3 fee tier to a percentage.
 * @param tier - Fee tier in basis points (e.g. 3000)
 * @returns Percentage as decimal (e.g. 0.3)
 */
export const feeTierToPercent = (tier: number): number => tier / 10_000

import { tokenContracts } from '@/lib/contracts'
import {
  USDT0,
  USDRIF,
  UNISWAP_UNIVERSAL_ROUTER_ADDRESS,
  UNISWAP_QUOTER_V2_ADDRESS,
  ICECREAMSWAP_ROUTER_ADDRESS,
  USDT0_USDRIF_POOL_ADDRESS,
} from '@/lib/constants'

/**
 * Token addresses for swap operations
 * Imported from centralized token contracts configuration
 */
export const SWAP_TOKEN_ADDRESSES = {
  USDT0: tokenContracts[USDT0],
  USDRIF: tokenContracts[USDRIF],
} as const

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

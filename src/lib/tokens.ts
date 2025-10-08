import { getAddress } from 'viem'
import { COINBASE_ADDRESS, ENV, RIF_ADDRESS, STRIF_ADDRESS, USDRIF_ADDRESS } from './constants'

export const TOKEN_SYMBOLS = {
  USD: 'USD',
  RBTC: ENV === 'mainnet' ? 'rBTC' : 'tRBTC',
  RIF: ENV === 'mainnet' ? 'RIF' : 'tRIF',
  STRIF: 'stRIF',
  USDRIF: 'USDRIF',
} as const

export const { USD, RBTC, RIF, STRIF, USDRIF } = TOKEN_SYMBOLS

export const TOKENS = {
  rif: {
    address: getAddress(RIF_ADDRESS),
    symbol: RIF,
  },
  strif: {
    address: getAddress(STRIF_ADDRESS),
    symbol: STRIF,
  },
  rbtc: {
    address: COINBASE_ADDRESS,
    symbol: RBTC,
  },
  usdrif: {
    address: getAddress(USDRIF_ADDRESS),
    symbol: USDRIF,
  },
} as const

export type TokenSymbol = keyof typeof TOKENS
export type TokenInfo = (typeof TOKENS)[TokenSymbol]

export const getTokenBySymbol = (symbol: string) => TOKENS[symbol as TokenSymbol]
export const getTokenAddress = (symbol: string) => TOKENS[symbol as TokenSymbol]?.address
export const getAllTokenSymbols = () => Object.keys(TOKENS) as TokenSymbol[]
export const getAllTokens = () => Object.values(TOKENS)

/**
 * Find a token from a tokens object by matching its symbol
 * Handles both mainnet and testnet variants (e.g., 'RIF' or 'tRIF')
 */
export const findTokenBySymbol = <T extends { symbol: string }>(
  tokens: { [key: string]: T },
  ...symbolVariants: string[]
): T | undefined => {
  const tokenEntries = Object.entries(tokens)
  return tokenEntries.find(([_, token]) => symbolVariants.includes(token.symbol))?.[1]
}

/**
 * Extract RIF and RBTC tokens from a tokens object
 * Returns both tokens or undefined if not found
 */
export const extractRifRbtcTokens = <T extends { symbol: string }>(tokens: { [key: string]: T }) => {
  const rif = findTokenBySymbol(tokens, 'RIF', 'tRIF')
  const rbtc = findTokenBySymbol(tokens, 'rBTC', 'tRBTC')
  return { rif, rbtc }
}

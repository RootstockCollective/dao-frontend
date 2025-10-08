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

// This helper functions are not used anywhere but could be useful.
// They could be removed if not needed though.
export const getTokenBySymbol = (symbol: string) => TOKENS[symbol as TokenSymbol]
export const getTokenAddress = (symbol: string) => TOKENS[symbol as TokenSymbol]?.address
export const getAllTokenSymbols = () => Object.keys(TOKENS) as TokenSymbol[]
export const getAllTokens = () => Object.values(TOKENS)

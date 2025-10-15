import { Abi, Address, getAddress, isAddressEqual } from 'viem'
import { RIFTokenAbi } from './abis/RIFTokenAbi'
import { StRIFTokenAbi } from './abis/StRIFTokenAbi'
import { COINBASE_ADDRESS, ENV, RIF_ADDRESS, STRIF_ADDRESS, USDRIF_ADDRESS } from './constants'

const NON_ADDRESSABLE_SYMBOLS = {
  USD: 'USD',
} as const

const ADDRESSABLE_SYMBOLS = {
  RBTC: ENV === 'mainnet' ? 'RBTC' : 'tRBTC',
  RIF: ENV === 'mainnet' ? 'RIF' : 'tRIF',
  STRIF: 'stRIF',
  USDRIF: 'USDRIF',
} as const

export const { RBTC, RIF, STRIF, USDRIF } = ADDRESSABLE_SYMBOLS
export const { USD } = NON_ADDRESSABLE_SYMBOLS

export type TokenSymbol = typeof ADDRESSABLE_SYMBOLS[keyof typeof ADDRESSABLE_SYMBOLS]

export type FiatSymbol = typeof NON_ADDRESSABLE_SYMBOLS[keyof typeof NON_ADDRESSABLE_SYMBOLS]

export type Token = {
  address: Address
  symbol: TokenSymbol
  decimals: number
  abi: Abi
}

export type NativeCurrency = {
  address: Address // Coinbase address
  symbol: TokenSymbol
  decimals: number
}

export type Fiat = {
  symbol: FiatSymbol
}

export type SupportedToken = Partial<{
  [Key in TokenSymbol]: Key extends typeof ADDRESSABLE_SYMBOLS['RBTC'] ? NativeCurrency : Token
}>

export const TOKENS = {
  [ADDRESSABLE_SYMBOLS.RIF]: {
    address: getAddress(RIF_ADDRESS),
    symbol: ADDRESSABLE_SYMBOLS.RIF,
    decimals: 18,
    abi: RIFTokenAbi,
  },
  [ADDRESSABLE_SYMBOLS.STRIF]: {
    address: getAddress(STRIF_ADDRESS),
    symbol: ADDRESSABLE_SYMBOLS.STRIF,
    decimals: 18,
    abi: StRIFTokenAbi,
  },
  [ADDRESSABLE_SYMBOLS.RBTC]: {
    address: COINBASE_ADDRESS,
    symbol: ADDRESSABLE_SYMBOLS.RBTC,
    decimals: 18,
  },
  [ADDRESSABLE_SYMBOLS.USDRIF]: {
    address: getAddress(USDRIF_ADDRESS),
    symbol: ADDRESSABLE_SYMBOLS.USDRIF,
    decimals: 18,
    abi: RIFTokenAbi,
  },
}


/**
 * A case insensitive helper function to check if a symbol is a valid token symbol
 * @param symbol - The symbol to check
 * @returns True if the symbol is a valid token symbol, false otherwise
 */
const tokenSymbols = Object.keys(ADDRESSABLE_SYMBOLS) as TokenSymbol[]
export const isSupportedTokenSymbol = (symbol: string): symbol is TokenSymbol => {
  return tokenSymbols.some((name) => name.toLocaleLowerCase() === symbol.toLocaleLowerCase())
}

/**
 * A case insensitive helper function to check if a symbol is a valid fiat symbol
 * @param symbol - The symbol to check
 * @returns True if the symbol is a valid fiat symbol, false otherwise
 */
const fiatSymbols = Object.keys(NON_ADDRESSABLE_SYMBOLS) as FiatSymbol[]
export const isSupportedFiatSymbol = (symbol: string): symbol is FiatSymbol => {
  return fiatSymbols.some((name) => name.toLocaleLowerCase() === symbol.toLocaleLowerCase())
}

/**
 * A helper function to check if a token address is valid for a given token symbol
 * @param symbol - The token symbol to check
 * @param address - The address to check
 * @returns True if the address is valid for the given token symbol, false otherwise
 */
export const isValidTokenAddress = (symbol: TokenSymbol, address: Address): boolean => {
  return isAddressEqual(TOKENS[symbol].address, address)
}

/**
 * A helper function to get a token by a normalized (uppercased) symbol
 * @param symbol - The symbol to get the token for
 * @returns The token
 */
export const getTokenByNormalizedSymbol = (symbol: TokenSymbol): Token => {
  return Object.values(TOKENS).find((token) => token.symbol.toUpperCase() === symbol.toUpperCase()) as Token
}
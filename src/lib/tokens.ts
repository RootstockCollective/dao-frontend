import { Address, getAddress } from 'viem'
import { COINBASE_ADDRESS, RBTC, RIF, STRIF, USDRIF, USDT0 } from './constants'
import { tokenContracts } from './contracts'

export const TOKENS = {
  rif: {
    address: getAddress(tokenContracts.RIF),
    symbol: RIF,
    icon: '/images/rif-logo.png',
  },
  rbtc: {
    address: getAddress(COINBASE_ADDRESS),
    symbol: RBTC,
    icon: '/images/rbtc-icon.svg',
  },
  usdrif: {
    address: getAddress(tokenContracts.USDRIF),
    symbol: USDRIF,
    icon: '/images/usdrif-logo.png',
  },
  strif: {
    address: getAddress(tokenContracts.stRIF),
    symbol: STRIF,
    icon: '/images/rif-logo.png',
  },
  usdt0: {
    address: getAddress(tokenContracts.USDT0),
    symbol: USDT0,
    icon: '/images/usdt0-logo.png',
  },
} as const

/** Find token by symbol (case-insensitive) */
export const findTokenBySymbol = (symbol: string) =>
  Object.values(TOKENS).find(t => t.symbol.toUpperCase() === symbol.toUpperCase())

export const REWARD_TOKEN_KEYS = ['rif', 'rbtc', 'usdrif'] as Array<
  keyof Omit<typeof TOKENS, 'strif' | 'usdt0'>
>
export type RewardTokenKey = (typeof REWARD_TOKEN_KEYS)[number]
export const REWARD_TOKENS = REWARD_TOKEN_KEYS.map(tokenKey => TOKENS[tokenKey])

export type RewardToken = (typeof TOKENS)[RewardTokenKey]

export const TOKENS_BY_ADDRESS = Object.values(TOKENS).reduce(
  (acc, token) => {
    acc[token.address] = token
    return acc
  },
  {} as Record<Address, (typeof TOKENS)[keyof typeof TOKENS]>,
)

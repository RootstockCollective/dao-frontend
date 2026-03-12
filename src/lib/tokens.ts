import { Address, getAddress } from 'viem'

import { COINBASE_ADDRESS, RBTC, RIF, STRIF, USDRIF, USDT0 } from './constants'
import { tokenContracts } from './contracts'

export const TOKENS = {
  rif: {
    address: getAddress(tokenContracts.RIF),
    symbol: RIF,
    testnetSymbol: 'tRIF',
    icon: '/images/rif-logo.png',
  },
  rbtc: {
    address: getAddress(COINBASE_ADDRESS),
    symbol: RBTC,
    testnetSymbol: 'tRBTC',
    icon: '/images/rbtc-icon.svg',
  },
  usdrif: {
    address: getAddress(tokenContracts.USDRIF),
    symbol: USDRIF,
    testnetSymbol: USDRIF,
    icon: '/images/usdrif-logo.png',
  },
  strif: {
    address: getAddress(tokenContracts.stRIF),
    symbol: STRIF,
    testnetSymbol: STRIF,
    icon: '/images/rif-logo.png',
  },
  usdt0: {
    address: getAddress(tokenContracts.USDT0),
    symbol: USDT0,
    testnetSymbol: USDT0,
    icon: '/images/usdt0-logo.png',
  },
} as const

/** Find token by symbol (checks object key, current env symbol, and testnet variant) */
export const findTokenBySymbol = (symbol: string) => {
  const upperSymbol = symbol.toUpperCase()
  return Object.entries(TOKENS).find(
    ([key, t]) =>
      key.toUpperCase() === upperSymbol ||
      t.symbol.toUpperCase() === upperSymbol ||
      t.testnetSymbol.toUpperCase() === upperSymbol,
  )?.[1]
}

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

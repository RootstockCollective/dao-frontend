import { getAddress } from 'viem'
import { COINBASE_ADDRESS, RBTC, RIF, STRIF, USDRIF } from './constants'
import { tokenContracts } from './contracts'

export const TOKENS = {
  rif: {
    address: getAddress(tokenContracts.RIF),
    symbol: RIF,
  },
  rbtc: {
    address: COINBASE_ADDRESS,
    symbol: RBTC,
  },
  usdrif: {
    address: getAddress(tokenContracts.USDRIF),
    symbol: USDRIF,
  },
  strif: {
    address: getAddress(tokenContracts.stRIF),
    symbol: STRIF,
  },
} as const

export const REWARD_TOKEN_KEYS = ['rif', 'usdrif', 'rbtc'] as Array<keyof Omit<typeof TOKENS, 'strif'>>
export type RewardTokenKey = (typeof REWARD_TOKEN_KEYS)[number]
export const REWARD_TOKENS = REWARD_TOKEN_KEYS.map(tokenKey => TOKENS[tokenKey])

export const getTokenByAddress = (address: string) => {
  const normalizedAddress = address.toLowerCase()
  return Object.values(TOKENS).find(token => token.address.toLowerCase() === normalizedAddress)
}
export type RewardToken = (typeof TOKENS)[RewardTokenKey]

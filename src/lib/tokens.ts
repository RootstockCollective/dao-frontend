import { getAddress } from 'viem'
import { COINBASE_ADDRESS, RBTC, RIF, STRIF, USDRIF } from './constants'
import { tokenContracts } from './contracts'

export const TOKENS = {
  rif: {
    address: getAddress(tokenContracts.RIF),
    symbol: RIF,
  },
  strif: {
    address: getAddress(tokenContracts.stRIF),
    symbol: STRIF,
  },
  usdrif: {
    address: getAddress(tokenContracts.USDRIF),
    symbol: USDRIF,
  },
  rbtc: {
    address: COINBASE_ADDRESS,
    symbol: RBTC,
  },
} as const

export const REWARD_TOKEN_KEYS = Object.keys(TOKENS).filter(key => key !== 'strif') as Array<
  keyof Omit<typeof TOKENS, 'strif'>
>
export const REWARD_TOKENS = REWARD_TOKEN_KEYS.map(tokenKey => TOKENS[tokenKey])

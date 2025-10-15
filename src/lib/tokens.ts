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

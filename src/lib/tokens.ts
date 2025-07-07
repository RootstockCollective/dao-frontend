import { getAddress } from 'viem'
import { COINBASE_ADDRESS, RBTC, RIF } from './constants'
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
}

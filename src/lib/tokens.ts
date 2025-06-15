import { Address, getAddress } from 'viem'
import { COINBASE_ADDRESS } from './constants'
import { tokenContracts } from './contracts'

export interface TokenInfo {
  address: Address
  symbol: string
}

export const getTokens = (): { rif: TokenInfo; rbtc: TokenInfo } => ({
  rif: {
    address: getAddress(tokenContracts.RIF),
    symbol: 'RIF',
  },
  rbtc: {
    address: COINBASE_ADDRESS,
    symbol: 'RBTC',
  },
})

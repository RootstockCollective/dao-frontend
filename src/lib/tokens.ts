import { getAddress } from 'viem'
import { COINBASE_ADDRESS, RBTC, RIF } from './constants'
import { tokenContracts } from './contracts'
import { Token } from '@/app/collective-rewards/rewards/types'

export const getTokens = (): { rif: Token; rbtc: Token } => ({
  rif: {
    address: getAddress(tokenContracts.RIF),
    symbol: RIF,
  },
  rbtc: {
    address: COINBASE_ADDRESS,
    symbol: RBTC,
  },
})

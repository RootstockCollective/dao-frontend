import { RBTC, RIF, USDRIF } from '@/lib/constants'
import Big from 'big.js'

// Not this again...
export type TokenSymbol = typeof RIF | typeof RBTC | typeof USDRIF

export type MetricToken = {
  symbol: TokenSymbol
  value: string
  fiatValue: Big
}

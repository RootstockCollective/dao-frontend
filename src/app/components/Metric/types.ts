import type { TokenSymbol } from '@/components/TokenImage'
import Big from 'big.js'

export type { TokenSymbol } from '@/components/TokenImage'

export type MetricToken = {
  symbol: TokenSymbol
  value: string
  fiatValue: Big
}

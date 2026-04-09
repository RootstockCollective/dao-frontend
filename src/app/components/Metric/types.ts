import Big from 'big.js'

import type { TokenSymbol } from '@/components/TokenImage'

export type { TokenSymbol } from '@/components/TokenImage'

export interface MetricToken {
  symbol: TokenSymbol
  value: string
  fiatValue: Big
}

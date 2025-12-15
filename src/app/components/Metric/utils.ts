import { getFiatAmount, formatSymbol } from '@/app/shared/formatter'
import { formatCurrency } from '@/lib/utils'
import { MetricToken, TokenSymbol } from './types'

export const createMetricToken = ({
  value,
  price,
  symbol,
}: {
  value: bigint
  price: number
  symbol: TokenSymbol
}): MetricToken => {
  const fiatValue = getFiatAmount(value, price)

  return {
    symbol,
    value: formatSymbol(value, symbol),
    fiatValue: formatCurrency(fiatValue, { showCurrencySymbol: false }),
  }
}

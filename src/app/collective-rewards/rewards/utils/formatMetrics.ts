import { formatCurrency } from '@/app/collective-rewards/utils/formatter'

export const formatMetrics = (
  amount: number | bigint,
  price: number | bigint,
  symbol: string,
  currency: string,
) => ({
  amount: `${formatCurrency(amount, symbol) || 0} ${symbol}`,
  fiatAmount: `= ${currency} ${formatCurrency(Number(amount) * Number(price), currency) || 0}`,
})

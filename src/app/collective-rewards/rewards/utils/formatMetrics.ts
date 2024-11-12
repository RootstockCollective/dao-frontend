import { formatCurrency, toFixed } from '@/lib/utils'

export const formatMetrics = (amount: number, price: number, symbol: string, currency: string) => ({
  amount: `${toFixed(amount)} ${symbol}`,
  fiatAmount: `= ${currency} ${formatCurrency(amount * price, currency)}`,
})

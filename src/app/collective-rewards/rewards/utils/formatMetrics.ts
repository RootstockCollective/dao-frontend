import { formatCurrency } from '@/app/collective-rewards/utils/formatting/formatter'

export const formatMetrics = (
  amount: number | bigint,
  price: number | bigint,
  symbol: string,
  currency: string,
) => {
  return {
    amount: `${formatCurrency(amount, symbol) || 0} ${symbol}`,
    fiatAmount: `= ${currency} ${formatCurrency(Number(formatCurrency(amount, symbol, { thousandsSeparator: '', round: { decimalPlaces: 18 } })) * Number(price) || 0, currency)}`,
  }
}

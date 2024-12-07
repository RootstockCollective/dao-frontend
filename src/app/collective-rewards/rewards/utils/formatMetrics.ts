import { formatCurrency, toFixed } from '@/lib/utils'
import { formatUnits } from 'viem'

export const formatMetrics = (amount: number, price: number, symbol: string, currency: string) => ({
  amount: `${toFixed(amount)} ${symbol}`,
  fiatAmount: `= ${currency} ${formatCurrency(amount * price, currency)}`,
})

export const formatOnchainFraction = (amount: bigint, displayDecimals = 2, decimals = 18) => {
  const formattedAmount = formatUnits(amount, decimals)
  const length =
    formattedAmount.indexOf('.') >= 0
      ? formattedAmount.indexOf('.') + displayDecimals + 1
      : formattedAmount.length
  return formattedAmount.slice(0, length)
}

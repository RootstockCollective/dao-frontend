import { formatSymbol, getFiatAmount } from '@/app/utils'
import { formatCurrency } from '@/lib/utils'
import { USD } from '@/lib/constants'

export const formatRewards = (rewards: bigint, price: number, symbol: string) => {
  const amount = formatSymbol(rewards, symbol)
  const fiatAmount = formatCurrency(getFiatAmount(rewards, price), {
    currency: USD,
    showCurrency: true,
  })
  return {
    amount,
    fiatAmount,
  }
}

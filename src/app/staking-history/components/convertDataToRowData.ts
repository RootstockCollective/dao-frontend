import { GetPricesResult } from '@/app/user/types'
import { StakingHistoryItem } from '@/app/staking-history/utils/types'
import { StakingHistoryTable } from '@/app/staking-history/components/StakingHistoryTable.config'
import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'
import { RIF, STRIF } from '@/lib/constants'
import { formatExpandedDate } from '@/app/my-rewards/tx-history/utils/utils'

const formatPeriod = (period: string): string => {
  const [year, month] = period.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

export const convertDataToRowData = (
  data: StakingHistoryItem[],
  prices: GetPricesResult,
): StakingHistoryTable['Row'][] => {
  if (!data.length) return []

  const price = prices[RIF]?.price ?? 0

  // Pre-allocate array size for better performance
  const rows: StakingHistoryTable['Row'][] = new Array(data.length)

  for (let i = 0; i < data.length; i++) {
    const staking = data[i]
    const itemAmount = BigInt(staking.amount)
    const usdAmount = getFiatAmount(itemAmount, price)

    rows[i] = {
      id: `${staking.period}-${i}`,
      data: {
        period: formatPeriod(staking.period),
        action: staking.action,
        amount: formatSymbol(staking.amount, STRIF),
        total_amount: usdAmount.toFixed(2).toString(),
        transactions: staking.transactions.map(tx => ({
          ...tx,
          date: formatExpandedDate(String(tx.timestamp)),
          amount: formatSymbol(tx.amount, STRIF),
          total_amount: getFiatAmount(BigInt(tx.amount), price).toFixed(2).toString(),
        })),
        actions: '',
      },
    }
  }

  return rows
}

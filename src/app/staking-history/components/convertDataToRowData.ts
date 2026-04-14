import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'
import { StakingHistoryTable } from '@/app/staking-history/components/StakingHistoryTable.config'
import { StakingHistoryItem } from '@/app/staking-history/utils/types'
import { GetPricesResult } from '@/app/user/types'
import { RIF, STRIF } from '@/lib/constants'
import { formatDateExpanded, formatPeriodToMonthYear } from '@/lib/utils'

export const convertDataToRowData = (
  data: StakingHistoryItem[],
  prices: GetPricesResult,
): StakingHistoryTable['Row'][] => {
  if (!data.length) return []

  const price = prices[RIF]?.price ?? 0

  // Pre-allocate array size for better performance
  const rows: StakingHistoryTable['Row'][] = new Array(data.length)

  for (const [i, staking] of data.entries()) {
    const itemAmount = BigInt(staking.amount)
    const usdAmount = getFiatAmount(itemAmount, price)

    rows[i] = {
      id: `${staking.period}-${i}`,
      data: {
        period: formatPeriodToMonthYear(staking.period),
        action: staking.action,
        amount: formatSymbol(staking.amount, STRIF),
        total_amount: usdAmount.toFixed(2).toString(),
        transactions: staking.transactions.map(tx => ({
          ...tx,
          date: formatDateExpanded(String(tx.timestamp)),
          amount: formatSymbol(tx.amount, STRIF),
          total_amount: getFiatAmount(BigInt(tx.amount), price).toFixed(2).toString(),
        })),
        actions: '',
      },
    }
  }

  return rows
}

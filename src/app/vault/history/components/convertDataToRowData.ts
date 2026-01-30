import { VaultHistoryItemAPI } from '@/app/vault/history/utils/types'
import { VaultHistoryTable } from '@/app/vault/history/components/VaultHistoryTable.config'
import { formatSymbol } from '@/app/shared/formatter'
import { formatExpandedDate } from '@/app/my-rewards/tx-history/utils/utils'

const TOKEN_SYMBOL = 'USDRIF'
const TOKEN_DECIMALS = 18

const formatPeriod = (period: string): string => {
  const [year, month] = period.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

/**
 * Converts raw API data to table row data
 * Transforms VaultHistoryItemAPI (from API) to table rows with formatted dates
 */
export const convertDataToRowData = (data: VaultHistoryItemAPI[]): VaultHistoryTable['Row'][] => {
  if (!data.length) return []

  const rows: VaultHistoryTable['Row'][] = new Array(data.length)

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    const assetsFormatted = formatSymbol(item.assets, TOKEN_SYMBOL)
    // USDRIF is pegged to USD, so 1 USDRIF ≈ 1 USD
    const usdAmount = Number(item.assets) / 10 ** TOKEN_DECIMALS
    // Withdrawals should be shown as negative amounts
    const signedUsdAmount = item.action === 'WITHDRAW' ? -usdAmount : usdAmount

    rows[i] = {
      id: `${item.period}-${item.action}-${i}`,
      data: {
        period: formatPeriod(item.period),
        action: item.action,
        assets: assetsFormatted,
        total_usd: signedUsdAmount.toFixed(2),
        transactions: item.transactions.map(tx => ({
          ...tx,
          date: formatExpandedDate(String(tx.timestamp)),
          assets: formatSymbol(tx.assets, TOKEN_SYMBOL),
        })),
        actions: '',
      },
    }
  }

  return rows
}

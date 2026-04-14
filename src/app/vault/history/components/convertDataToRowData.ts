import { formatSymbol } from '@/app/shared/formatter'
import { TOKEN_SYMBOL, VaultHistoryTable } from '@/app/vault/history/components/VaultHistoryTable.config'
import { VaultHistoryItemAPI } from '@/app/vault/history/utils/types'
import Big from '@/lib/big'
import { formatDateExpanded, formatPeriodToMonthYear } from '@/lib/utils'

const TOKEN_DECIMALS = 18

/** Safely converts wei string to USD string using Big.js arithmetic */
const weiToUsd = (wei: string): string => Big(wei).div(Big(10).pow(TOKEN_DECIMALS)).toFixed(2)

/**
 * Converts raw API data to table row data
 * Transforms VaultHistoryItemAPI (from API) to table rows with formatted dates
 */
export const convertDataToRowData = (data: VaultHistoryItemAPI[]): VaultHistoryTable['Row'][] => {
  if (!data.length) return []

  const rows: VaultHistoryTable['Row'][] = new Array(data.length)

  for (const [i, item] of data.entries()) {
    const assetsFormatted = formatSymbol(item.assets, TOKEN_SYMBOL)
    // USDRIF is pegged to USD, so 1 USDRIF ≈ 1 USD
    const usdValue = weiToUsd(item.assets)
    // Withdrawals should be shown as negative amounts
    const signedUsdAmount = item.action === 'WITHDRAW' ? `-${usdValue}` : usdValue

    rows[i] = {
      id: `${item.period}-${item.action}-${i}`,
      data: {
        period: formatPeriodToMonthYear(item.period),
        action: item.action,
        assets: assetsFormatted,
        total_usd: signedUsdAmount,
        transactions: item.transactions.map(tx => ({
          ...tx,
          date: formatDateExpanded(String(tx.timestamp)),
          assets: formatSymbol(tx.assets, TOKEN_SYMBOL),
          total_usd: weiToUsd(tx.assets),
        })),
        actions: '',
      },
    }
  }

  return rows
}

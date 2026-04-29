import type { BtcVaultNavHistoryItem } from '@/app/api/btc-vault/v1/nav-history/types'
import { formatDateMonthFirst } from '@/app/btc-vault/services/ui/formatters'
import Big from '@/lib/big'
import { WeiPerEther } from '@/lib/constants'
import { formatCurrency, formatCurrencyWithLabel } from '@/lib/utils'
import type { Row } from '@/shared/context'

import type { NavColumnId, NavHistoryCellDataMap } from './config'

export function convertNavDataToRowData(
  data: readonly BtcVaultNavHistoryItem[],
  rbtcPrice: number,
): Row<NavColumnId, string, NavHistoryCellDataMap>[] {
  if (!data.length) return []

  return data.map(item => {
    const assets = Big(item.reportedOffchainAssets).div(WeiPerEther.toString())
    const fiatAmountFormatted = rbtcPrice > 0 ? formatCurrencyWithLabel(assets.mul(rbtcPrice)) : null

    return {
      id: item.id,
      data: {
        reportedOffchainAssets: formatCurrency(assets, { showCurrencySymbol: false }),
        requestsProcessed: `${item.requestsProcessed} ${item.requestsProcessed === 1 ? 'Request' : 'Requests'}`,
        processedAt: formatDateMonthFirst(item.processedAt),
        fiatAmountFormatted,
        transactionHashFull: item.transactionHash,
        processedAtTimestamp: item.processedAt,
      },
    }
  })
}

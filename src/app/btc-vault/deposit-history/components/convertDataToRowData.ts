import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'
import { RBTC } from '@/lib/constants'
import { formatCurrencyWithLabel } from '@/lib/utils'
import type { Row } from '@/shared/context'

import type { DepositWindowRow } from '../../services/types'
import { formatDateShort } from '../../services/ui/formatters'
import type { ColumnId, DepositHistoryCellDataMap } from './DepositHistoryTable.config'

/**
 * Maps deposit window data to table row format expected by TableContext.
 * @param data - Array of deposit window rows from the hook
 * @param rbtcPrice - Current rBTC price in USD
 * @returns Array of typed table rows with all visible and data-only columns populated
 */
export function convertDataToRowData(
  data: DepositWindowRow[] | undefined,
  rbtcPrice: number,
): Row<ColumnId, string, DepositHistoryCellDataMap>[] {
  if (!data) return []

  return data.map(row => ({
    id: row.epochId,
    data: {
      depositWindow: row.epochId,
      startDate: row.startDate !== null ? formatDateShort(row.startDate) : '—',
      endDate: row.endDate !== null ? formatDateShort(row.endDate) : '—',
      tvl: row.tvl !== null ? formatSymbol(row.tvl, RBTC) : '—',
      apy: row.apy !== null ? `${row.apy.toFixed(2)}%` : '—',
      fiatTvl:
        row.tvl !== null && rbtcPrice > 0 ? formatCurrencyWithLabel(getFiatAmount(row.tvl, rbtcPrice)) : null,
    },
  }))
}

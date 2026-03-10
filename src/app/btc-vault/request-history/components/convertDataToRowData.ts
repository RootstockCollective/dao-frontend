import type { Row } from '@/shared/context'

import type { RequestHistoryRowDisplay } from '../../services/ui/types'
import { DISPLAY_REQUEST_TYPE_LABELS } from '../../services/ui/types'
import type { BtcVaultHistoryCellDataMap, ColumnId } from './BtcVaultHistoryTable.config'

/** Maps display DTOs to table row format expected by TableContext. */
export function convertDataToRowData(
  data: RequestHistoryRowDisplay[] | undefined,
): Row<ColumnId, string, BtcVaultHistoryCellDataMap>[] {
  if (!data) return []

  return data.map(row => ({
    id: row.id,
    data: {
      type: DISPLAY_REQUEST_TYPE_LABELS[row.type],
      date: row.createdAtFormatted,
      amount: row.amountFormatted,
      status: row.displayStatus,
      actions: '',
      fiatAmount: row.fiatAmountFormatted,
      claimTokenType: row.claimTokenType,
      displayStatusLabel: row.displayStatusLabel,
      requestStatus: row.status,
      updatedAtFormatted: row.updatedAtFormatted,
      createdAtFormatted: row.createdAtFormatted,
      finalizedAtFormatted: row.finalizedAtFormatted,
      requestType: row.type,
      stateHistory: row.stateHistory,
    },
  }))
}

import { sortNavHistoryItems } from './sortNavHistoryItems'
import type { BtcVaultNavHistoryItem, BtcVaultNavHistoryPageResult, NavHistoryPagedParams } from './types'

/**
 * Blockscout-backed path: logs are aggregated into a full row list elsewhere; sorting and paging are app-side.
 */
export function paginateSortedBlockscoutNavRows(
  allRows: readonly BtcVaultNavHistoryItem[],
  params: NavHistoryPagedParams,
): BtcVaultNavHistoryPageResult {
  const total = allRows.length
  const sorted = sortNavHistoryItems(allRows, params.sort_field, params.sort_direction)
  const offset = (params.page - 1) * params.limit
  return {
    data: sorted.slice(offset, offset + params.limit),
    total,
  }
}

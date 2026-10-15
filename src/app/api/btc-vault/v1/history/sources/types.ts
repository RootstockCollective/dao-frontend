import type { BtcVaultHistoryItem, BtcVaultHistoryItemWithStatus, BtcVaultHistoryQueryParams } from '../types'

/** Data source that served the history page (mirrors epoch-history route observability). */
export type BtcVaultHistoryDataSourceName = 'state-sync' | 'the-graph' | 'blockscout'

/**
 * One history data source: list/count from that backend only, plus enrichment that does not cross sources.
 */
export interface BtcVaultHistorySource {
  name: BtcVaultHistoryDataSourceName
  fetchPageAndTotal: (
    params: BtcVaultHistoryQueryParams,
  ) => Promise<{ items: BtcVaultHistoryItem[]; total: number }>
  enrichWithStatus: (items: BtcVaultHistoryItem[]) => Promise<BtcVaultHistoryItemWithStatus[]>
}

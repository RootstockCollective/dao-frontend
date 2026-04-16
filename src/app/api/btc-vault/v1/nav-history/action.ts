import { fetchBtcVaultNavHistoryPageFromStateSync } from './stateSync'
import { fetchBtcVaultNavHistoryPageFromSubgraph } from './subgraph'
import type { BtcVaultNavHistoryPageResult, BtcVaultNavHistorySortField } from './types'

export type {
  BtcVaultNavHistoryItem,
  BtcVaultNavHistoryPageResult,
  BtcVaultNavHistorySortField,
} from './types'

/**
 * Paginated NAV history rows: **state-sync Postgres first**, then **subgraph** if the DB path throws.
 */
export async function fetchBtcVaultNavHistoryPage(params: {
  limit: number
  page: number
  sort_field: BtcVaultNavHistorySortField
  sort_direction: 'asc' | 'desc'
}): Promise<BtcVaultNavHistoryPageResult> {
  try {
    return await fetchBtcVaultNavHistoryPageFromStateSync(params)
  } catch (error) {
    console.warn('[btc-vault] NAV history: state sync failed; falling back to subgraph.', error)
    return await fetchBtcVaultNavHistoryPageFromSubgraph(params)
  }
}

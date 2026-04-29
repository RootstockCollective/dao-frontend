import { fetchBtcVaultWhitelistedUsersPageFromStateSync } from './stateSync'
import { fetchBtcVaultWhitelistedUsersPageFromSubgraph } from './subgraph'
import type { BtcVaultWhitelistedUsersPageResult, BtcVaultWhitelistedUsersSortField } from './types'

export type {
  BtcVaultWhitelistedUserItem,
  BtcVaultWhitelistedUsersPageResult,
  BtcVaultWhitelistedUsersSortField,
} from './types'

/**
 * Paginated whitelist rows: **state-sync Postgres first**, then **subgraph** if the DB path throws.
 */
export async function fetchBtcVaultWhitelistedUsersPage(params: {
  limit: number
  page: number
  sort_field: BtcVaultWhitelistedUsersSortField
  sort_direction: 'asc' | 'desc'
}): Promise<BtcVaultWhitelistedUsersPageResult> {
  try {
    return await fetchBtcVaultWhitelistedUsersPageFromStateSync(params)
  } catch (error) {
    console.warn('[btc-vault] Whitelist history: state sync failed; falling back to subgraph.', error)
    return await fetchBtcVaultWhitelistedUsersPageFromSubgraph(params)
  }
}

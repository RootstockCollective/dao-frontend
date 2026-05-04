import { fetchBtcVaultAuditLogPageFromStateSync } from './stateSync'
import { fetchBtcVaultAuditLogPageFromSubgraph } from './subgraph'
import type { BtcVaultAuditLogPageResult, ParsedQuery } from './types'

export type { BtcVaultAuditLogPageResult, ParsedQuery } from './types'

/**
 * Paginated audit log rows: **state-sync Postgres first**, then **subgraph** if the DB path throws.
 */
export async function fetchBtcVaultAuditLogPage(params: ParsedQuery): Promise<BtcVaultAuditLogPageResult> {
  try {
    return await fetchBtcVaultAuditLogPageFromStateSync(params)
  } catch (error) {
    console.warn('[btc-vault] Audit log: state sync failed; falling back to subgraph.', error)
    return await fetchBtcVaultAuditLogPageFromSubgraph(params)
  }
}

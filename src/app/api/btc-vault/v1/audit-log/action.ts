import { logger } from '@/lib/logger'

import { fetchBtcVaultAuditLogPageFromStateSync } from './stateSync'
import { fetchBtcVaultAuditLogPageFromSubgraph } from './subgraph'
import type { BtcVaultAuditLogPageResult, ParsedQuery } from './types'

export type { BtcVaultAuditLogPageResult, ParsedQuery } from './types'

/**
 * Paginated audit log rows: **state-sync Postgres first**, then **subgraph** if the DB path throws.
 */
export async function fetchBtcVaultAuditLogPage(params: ParsedQuery): Promise<BtcVaultAuditLogPageResult> {
  const sources = [fetchBtcVaultAuditLogPageFromStateSync, fetchBtcVaultAuditLogPageFromSubgraph] as const

  let lastErr: unknown

  for (const [index, fetchFromSource] of sources.entries()) {
    try {
      return await fetchFromSource(params)
    } catch (err) {
      lastErr = err

      const hasNextSource = index < sources.length - 1

      if (hasNextSource) {
        logger.warn({ err }, '[btc-vault] Audit log source failed; falling back to next source.')
      }
    }
  }

  logger.error({ err: lastErr }, '[btc-vault] Audit log: all sources failed.')

  throw lastErr
}

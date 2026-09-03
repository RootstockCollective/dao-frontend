import { logger } from '@/lib/logger'

import { fetchBtcVaultNavHistoryPagedFromBlockscout } from './blockscout'
import { fetchBtcVaultNavHistoryPageFromStateSync } from './stateSync'
import { fetchBtcVaultNavHistoryPageFromSubgraph } from './subgraph'
import type { BtcVaultNavHistoryPageResult, NavHistoryPagedParams } from './types'

export type {
  BtcVaultNavDepositRequest,
  BtcVaultNavHistoryItem,
  BtcVaultNavHistoryPageResult,
  BtcVaultNavHistorySortField,
  BtcVaultNavRedeemRequest,
  NavHistoryPagedParams,
} from './types'

export async function fetchBtcVaultNavHistoryPage(
  params: NavHistoryPagedParams,
): Promise<BtcVaultNavHistoryPageResult> {
  const sources = [
    fetchBtcVaultNavHistoryPageFromStateSync,
    fetchBtcVaultNavHistoryPageFromSubgraph,
    fetchBtcVaultNavHistoryPagedFromBlockscout,
  ] as const

  let lastErr: unknown

  for (const [index, fetchFromSource] of sources.entries()) {
    try {
      return await fetchFromSource(params)
    } catch (err) {
      lastErr = err

      const hasNextSource = index < sources.length - 1

      if (hasNextSource) {
        logger.warn({ err }, '[btc-vault] NAV history source failed; falling back to next source.')
      }
    }
  }

  logger.error({ err: lastErr }, '[btc-vault] NAV history: all sources failed.')

  throw lastErr
}

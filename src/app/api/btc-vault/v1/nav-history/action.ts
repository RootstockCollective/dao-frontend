// import { fetchBtcVaultNavHistoryPageFromStateSync } from './stateSync'
// import { fetchBtcVaultNavHistoryPageFromSubgraph } from './subgraph'
import { fetchBtcVaultNavHistoryPageFromBlockscout } from './blockscout'
import type { BtcVaultNavHistoryPageResult } from './types'

export type {
  BtcVaultNavDepositRequest,
  BtcVaultNavHistoryItem,
  BtcVaultNavHistoryPageResult,
  BtcVaultNavHistorySortField,
  BtcVaultNavRedeemRequest,
} from './types'

/**
 * All NAV history rows sourced from **Blockscout** (`OffchainAssetsReported`
 * + `DepositRequested` + `RedeemRequest` logs). No pagination / sort params —
 * returns every row (sorted `processedAt` desc) plus `deposits` / `redeems`
 * grouped by epoch. State-sync and subgraph paths are commented out below;
 * re-enable them if Blockscout becomes unavailable.
 */
export async function fetchBtcVaultNavHistoryPage(): Promise<BtcVaultNavHistoryPageResult> {
  return await fetchBtcVaultNavHistoryPageFromBlockscout()

  // try {
  //   return await fetchBtcVaultNavHistoryPageFromStateSync(params)
  // } catch (error) {
  //   console.warn('[btc-vault] NAV history: state sync failed; falling back to subgraph.', error)
  //   return await fetchBtcVaultNavHistoryPageFromSubgraph(params)
  // }
}

import type { BtcVaultHistoryItem } from '../../types'
import type { BtcVaultHistorySource } from '../types'
import { enrichHistoryWithRpcRequestStatus } from './enrich-rpc'
import { fetchBtcVaultHistoryFromBlockscout } from './fetch-history'
import type { GetFromBlockscoutSourceOptions } from './types'

export { mapDecodedVaultLogToHistoryItem, rpcGetLogToBlockscoutLogItem } from './decode-logs'
export { btcVaultRpcDisplayStatusForRequest, enrichHistoryWithRpcRequestStatus } from './enrich-rpc'
export { fetchBtcVaultHistoryFromBlockscout } from './fetch-history'
export type { BlockscoutLogItem, BlockscoutRpcLogsResponse, GetFromBlockscoutSourceOptions } from './types'

/**
 * Blockscout history source: logs from Blockscout `getLogs`, returns only REQUEST rows
 * (one per operation, matching the subgraph output shape). Cancelled requests are pre-enriched
 * from CANCEL events; remaining statuses via on-chain `pending*` / `claimable*` multicall.
 */
export function getFromBlockscoutSource(options: GetFromBlockscoutSourceOptions): BtcVaultHistorySource {
  const { mapActionOnly } = options
  return {
    name: 'blockscout',
    fetchPageAndTotal: fetchBtcVaultHistoryFromBlockscout,
    async enrichWithStatus(items: BtcVaultHistoryItem[]) {
      try {
        return await enrichHistoryWithRpcRequestStatus(items)
      } catch (error) {
        console.warn('[btc-vault][DAO-2106] RPC enrichment failed; using action-only displayStatus', error)
        return items.map(mapActionOnly)
      }
    },
  }
}

/**
 * Type flow for Vault History data:
 *
 * 1. Backend (action.ts) returns: VaultHistoryByPeriodAndAction
 * 2. API layer (api.ts) receives: VaultHistoryItemAPI (same structure, different name)
 * 3. Hook (useGetVaultHistory.ts) returns: VaultHistoryItemAPI[]
 * 4. Transform (convertDataToRowData.ts) converts: VaultHistoryItemAPI[] -> VaultHistoryTable['Row'][]
 *    - Adds 'date' field to each transaction
 *    - Formats assets and period
 * 5. Components use: VaultHistoryTransaction (with 'date' field)
 */

/**
 * Raw transaction data as received from the API
 * This matches the structure returned by the backend
 */
export interface VaultHistoryTransactionAPI {
  action: 'DEPOSIT' | 'WITHDRAW'
  assets: string
  shares: string
  blockNumber: string
  timestamp: number | string
  transactionHash: string
  user: string
}

/**
 * Transaction data after client-side transformation
 * Includes the formatted date field added by convertDataToRowData
 */
export interface VaultHistoryTransaction extends VaultHistoryTransactionAPI {
  date: string
}

/**
 * Vault history item grouped by period and action
 * Contains raw API transactions before transformation
 */
export interface VaultHistoryItemAPI {
  action: 'DEPOSIT' | 'WITHDRAW'
  assets: string
  period: string
  transactions: VaultHistoryTransactionAPI[]
}

/**
 * Vault history item after client-side transformation
 * Contains transactions with formatted dates
 */
export interface VaultHistoryItem {
  action: 'DEPOSIT' | 'WITHDRAW'
  assets: string
  period: string
  transactions: VaultHistoryTransaction[]
}

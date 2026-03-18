/**
 * Re-export API history item type for use in btc-vault mappers and hooks.
 * Pagination shape matches GET /api/btc-vault/v1/history response.
 */
import type { BtcVaultHistoryItemWithStatus } from '@/app/api/btc-vault/v1/history/action'

export type { BtcVaultHistoryItemWithStatus }

export interface BtcVaultHistoryPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface BtcVaultHistoryApiResponse {
  data: BtcVaultHistoryItemWithStatus[]
  pagination: BtcVaultHistoryPagination
}

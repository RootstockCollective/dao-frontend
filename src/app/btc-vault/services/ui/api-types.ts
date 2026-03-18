/**
 * Re-export API history item type for use in btc-vault mappers and hooks.
 * Pagination uses shared API type so frontend stays aligned with GET /api/btc-vault/v1/history.
 * API returns full PaginationResponse; we type the response so any code receiving it can use the full shape.
 */
import type { BtcVaultHistoryItemWithStatus } from '@/app/api/btc-vault/v1/history/action'
import type { PaginationResponse } from '@/app/api/utils/types'

export type { BtcVaultHistoryItemWithStatus }

export interface BtcVaultHistoryApiResponse {
  data: BtcVaultHistoryItemWithStatus[]
  pagination: PaginationResponse
}

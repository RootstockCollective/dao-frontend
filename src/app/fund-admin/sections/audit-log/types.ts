import type { Address, Hex } from 'viem'

import { TypedTable } from '@/shared/context'

export type AuditLogUserRole = 'ADMIN' | 'MANAGER' | 'PAUSER' | 'INVESTOR' | 'BUFFER_INJECTOR' | 'WHITELISTER'
export type ColumnId = 'date' | 'action' | 'value' | 'reason' | 'role'
export type SortableColumnId = 'date'
export type AuditLogShowFilter = 'reason' | 'rbtc' | 'wrbtc'

/**
 * Server-side representation of a subgraph `BtcVaultLog` entry (bigint fields are real BigInts).
 * Used only in server actions/API routes. Do NOT use on the client — JSON serialization converts
 * bigints to strings; use `AuditLogApiEntry` for client-side code.
 */
export interface AuditLogEntry {
  id: string
  vault: Address
  type: string
  amountInWei: bigint | null
  detail: string | null
  /** `true` = native RBTC, `false` = WRBTC (wrapped). */
  isNative: boolean | null
  role: string | null
  actor: Address
  from: Address | null
  destination: Address | null
  blockNumber: bigint
  blockTimestamp: bigint
  transactionHash: Hex
  logIndex: string
}

/**
 * Client-side shape of a `BtcVaultLog` as returned by the API route.
 * BigInt fields (`amountInWei`, `blockNumber`, `blockTimestamp`) are serialized as decimal strings
 */
export interface AuditLogApiEntry extends Omit<
  AuditLogEntry,
  'amountInWei' | 'blockNumber' | 'blockTimestamp'
> {
  amountInWei: string | null
  blockNumber: string
  blockTimestamp: string
}

interface AuditLogPagination {
  page: number
  limit: number
  offset: number
  total: number
  sort_field: string
  sort_direction: 'asc' | 'desc'
  totalPages: number
}

export interface AuditLogApiResponse {
  data: AuditLogApiEntry[]
  pagination: AuditLogPagination
}

export interface AuditLogHistoryPageParams {
  page: number
  limit: number
  sortField: SortableColumnId | null
  sortDirection: 'asc' | 'desc' | null
  filters?: AuditLogApiFilters
}

export interface AuditLogApiFilters {
  type?: string[]
  role?: AuditLogUserRole[]
  show?: AuditLogShowFilter[]
}

export interface UseGetAuditLogParams {
  /** Cumulative rows to show (expandable pager `end`). Fetches fixed-size API pages (max 200) and merges. */
  visibleItemCount: number
  sortField: SortableColumnId | null
  sortDirection: 'asc' | 'desc' | null
  filters?: AuditLogApiFilters
  /** Fetch guard for initial table setup to avoid transient requests. */
  isEnabled?: boolean
}

export interface UseGetAuditLogResult {
  entries: AuditLogApiEntry[]
  pagination: AuditLogPagination | undefined
  isLoading: boolean
  error: Error | null
}

export interface AuditLogCellDataMap {
  date: string
  action: string
  value: {
    formattedAmount: string
    usdAmount: string | null
  } | null
  reason: string | null
  role: AuditLogUserRole | null
}

export type AuditLogTableModel = TypedTable<ColumnId, AuditLogCellDataMap>

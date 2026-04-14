import type { Column } from '@/shared/context'

import type { AuditLogUserRole, ColumnId } from './types'

/** Page size for audit log list + `TablePager` expandable step. */
export const AUDIT_LOG_PAGE_SIZE = 20

export const AUDIT_LOG_FETCH_LIMIT = 200

export const DEFAULT_COLUMNS: Column<ColumnId>[] = [
  { id: 'date', hidden: false, sortable: true },
  { id: 'action', hidden: false, sortable: false },
  { id: 'value', hidden: false, sortable: false },
  { id: 'reason', hidden: false, sortable: false },
  { id: 'role', hidden: false, sortable: false },
]

export const LOG_TYPE_LABELS: Record<string, string> = {
  PAUSED_DEPOSITS: 'Paused deposits',
  RESUMED_DEPOSITS: 'Resumed deposits',
  PAUSED_REDEEMS: 'Paused redeems',
  RESUMED_REDEEMS: 'Resumed redeems',
  NAV_UPDATED: 'NAV updated',
  TRANSFER_TO_MANAGER_WALLET: 'Transfer to manager wallet',
  VAULT_DEPOSIT: 'Vault deposit',
  TOP_UP_BUFFER: 'Top up buffer',
  TOP_UP_SYNTHETIC_YIELD: 'Top up synthetic yield',
  SYNTHETIC_YIELD_UPDATED: 'Synthetic yield updated',
  BUFFER_UPDATED: 'Buffer updated',
}

export const FUND_MANAGER_LOG_TYPES = new Set([
  'NAV_UPDATED',
  'TRANSFER_TO_MANAGER_WALLET',
  'VAULT_DEPOSIT',
  'TOP_UP_BUFFER',
  'TOP_UP_SYNTHETIC_YIELD',
  'SYNTHETIC_YIELD_UPDATED',
  'BUFFER_UPDATED',
])

export const ROLE_STYLES: Record<AuditLogUserRole, string> = {
  ADMIN: 'bg-[#08ffd0] text-v3-text-0',
  MANAGER: 'bg-v3-rsk-purple text-v3-text-0',
  PAUSER: 'bg-blue-700 text-v3-text-100',
  INVESTOR: 'rounded-[16px] bg-[var(--Brand-Lime,#DEFF1A)]',
  BUFFER_INJECTOR: 'rounded-[16px] bg-success text-v3-text-0',
}

export const ROLE_LABELS: Record<AuditLogUserRole, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Fund Manager',
  PAUSER: 'Pauser',
  INVESTOR: 'Investor',
  BUFFER_INJECTOR: 'Injector',
}

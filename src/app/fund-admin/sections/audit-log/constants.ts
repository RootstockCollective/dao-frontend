import { RBTC, WRBTC } from '@/lib/constants'
import type { Column } from '@/shared/context'

import type { AuditLogShowFilter, AuditLogUserRole, ColumnId } from './types'

/** Page size for audit log list + `TablePager` expandable step. */
export const AUDIT_LOG_PAGE_SIZE = 20

/** Maximum number of rows to fetch per page. */
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
  WHITELISTED_USER: 'Whitelisted',
  DEWHITELISTED_USER: 'Dewhitelisted',
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

export const AUDIT_LOG_TYPE_FILTERS = [
  { label: 'Vault deposit', value: 'VAULT_DEPOSIT' },
  { label: 'Transfer to manager wallet', value: 'TRANSFER_TO_MANAGER_WALLET' },
  { label: 'NAV update', value: 'NAV_UPDATED' },
  { label: 'Top up synthetic yield APY', value: 'TOP_UP_SYNTHETIC_YIELD' },
  { label: 'Top up manual buffer', value: 'TOP_UP_BUFFER' },
  { label: 'Whitelisted', value: 'WHITELISTED_USER' },
  { label: 'Dewhitelisted', value: 'DEWHITELISTED_USER' },
]

export const AUDIT_LOG_SHOW_FILTERS: ReadonlyArray<{ label: string; value: AuditLogShowFilter }> = [
  { label: 'Reason', value: 'reason' },
  { label: RBTC, value: 'rbtc' },
  { label: WRBTC, value: 'wrbtc' },
]

export const AUDIT_LOG_ROLE_FILTERS: ReadonlyArray<{ label: string; value: AuditLogUserRole }> = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Fund manager', value: 'MANAGER' },
  { label: 'Whitelister', value: 'WHITELISTER' },
]

export const ROLE_STYLES: Record<AuditLogUserRole, string> = {
  ADMIN: 'bg-[#08ffd0] text-v3-text-0',
  MANAGER: 'bg-v3-rsk-purple text-v3-text-0',
  PAUSER: 'bg-v3-rif-blue text-v3-text-100',
  INVESTOR: 'bg-[var(--Brand-Lime,#DEFF1A)] text-v3-text-0',
  BUFFER_INJECTOR: 'bg-[#FFB020] text-v3-text-0',
  WHITELISTER: 'bg-success text-v3-text-0',
}

export const ROLE_LABELS: Record<AuditLogUserRole, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Fund manager',
  PAUSER: 'Pauser',
  INVESTOR: 'Investor',
  BUFFER_INJECTOR: 'Injector',
  WHITELISTER: 'Whitelister',
}

import { AUDIT_LOG_PAGE_SIZE } from '@/app/fund-admin/sections/audit-log/constants'
import type { AuditLogEntry, AuditLogUserRole } from '@/app/fund-admin/sections/audit-log/types'
import type { Column, TypedTable } from '@/shared/context'

export type ColumnId = 'date' | 'action' | 'valueReason' | 'role'

/** Columns that use three-state sort (desc → asc → unsorted), matching prior audit log UX. */
export type SortableColumnId = Exclude<ColumnId, 'valueReason'>

export const PAGE_SIZE = AUDIT_LOG_PAGE_SIZE

export const DEFAULT_HEADERS: Column<ColumnId>[] = [
  { id: 'date', hidden: false, sortable: true },
  { id: 'action', hidden: false, sortable: true },
  { id: 'valueReason', hidden: false, sortable: false },
  { id: 'role', hidden: false, sortable: true },
]

export interface AuditLogCellDataMap {
  date: string
  action: string
  /** Full entry for the value / token / reason cell */
  valueReason: AuditLogEntry
  role: AuditLogUserRole
}

export type AuditLogTableModel = TypedTable<ColumnId, AuditLogCellDataMap>

export function auditEntriesToRows(entries: AuditLogEntry[]): AuditLogTableModel['Row'][] {
  return entries.map(entry => ({
    id: entry.id,
    data: {
      date: entry.date,
      action: entry.action,
      valueReason: entry,
      role: entry.user,
    },
  }))
}

import type { AuditLogEntry } from '@/app/fund-admin/sections/audit-log/types'
import { MOCK_AUDIT_LOG_ENTRIES } from '@/app/fund-admin/sections/audit-log/mockEntries'
import type { z } from 'zod'

import { type BtcVaultAuditLogSortField, BtcVaultAuditLogQuerySchema } from '../schemas'

/** Set to `true` when subgraph query + mapping are implemented below. */
const USE_AUDIT_LOG_SUBGRAPH = false

type ParsedQuery = z.infer<typeof BtcVaultAuditLogQuerySchema>

export interface BtcVaultAuditLogPageResult {
  data: AuditLogEntry[]
  total: number
}

function compareEntries(a: AuditLogEntry, b: AuditLogEntry, field: BtcVaultAuditLogSortField): number {
  if (field === 'date') {
    return Date.parse(a.date) - Date.parse(b.date)
  }
  if (field === 'action') {
    return a.action.localeCompare(b.action)
  }
  return a.user.localeCompare(b.user)
}

function sortMockEntries(
  entries: AuditLogEntry[],
  sort_field: BtcVaultAuditLogSortField | undefined,
  sort_direction: 'asc' | 'desc' | undefined,
): AuditLogEntry[] {
  if (!sort_field || !sort_direction) {
    return [...entries]
  }
  return [...entries].sort((a, b) => {
    const cmp = compareEntries(a, b, sort_field)
    return sort_direction === 'asc' ? cmp : -cmp
  })
}

async function fetchAuditLogFromSubgraph(_params: ParsedQuery): Promise<BtcVaultAuditLogPageResult> {
  throw new Error(
    'fetchAuditLogFromSubgraph is not implemented. Add GQL query + map rows to AuditLogEntry, then set USE_AUDIT_LOG_SUBGRAPH.',
  )
}

function fetchAuditLogFromMock(params: ParsedQuery): BtcVaultAuditLogPageResult {
  const sorted = sortMockEntries(MOCK_AUDIT_LOG_ENTRIES, params.sort_field, params.sort_direction)
  const total = sorted.length
  const skip = (params.page - 1) * params.limit
  return {
    data: sorted.slice(skip, skip + params.limit),
    total,
  }
}

/**
 * One page of BTC vault audit log (mock or subgraph). Mirrors btc-vault whitelist-role-history action shape.
 */
export async function fetchBtcVaultAuditLogPage(params: ParsedQuery): Promise<BtcVaultAuditLogPageResult> {
  if (USE_AUDIT_LOG_SUBGRAPH) {
    return fetchAuditLogFromSubgraph(params)
  }
  return fetchAuditLogFromMock(params)
}

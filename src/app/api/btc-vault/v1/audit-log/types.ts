import type { z } from 'zod'

import type { AuditLogEntry } from '@/app/fund-admin/sections/audit-log/types'

import type { BtcVaultAuditLogQuerySchema } from '../schemas'

export type ParsedQuery = z.infer<typeof BtcVaultAuditLogQuerySchema>

export interface BtcVaultAuditLogPageResult {
  data: AuditLogEntry[]
  total: number
}

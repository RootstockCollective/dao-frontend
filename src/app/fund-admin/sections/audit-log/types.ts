export type AuditLogUserRole = 'Admin' | 'Fund Manager'

export interface AuditLogEntry {
  id: string
  date: string
  action: string
  valueReason: string | null
  tokenAmount: string | null
  usdAmount: string | null
  user: AuditLogUserRole
}

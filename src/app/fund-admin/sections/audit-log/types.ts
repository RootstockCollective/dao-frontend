export type AuditLogUserRole = 'Admin' | 'Fund Manager'

export interface AuditLogEntry {
  id: string
  date: string
  action: string
  detail: string | null
  tokenAmount: string | null
  /** Subgraph: `true` = native RBTC, `false` = WRBTC (wrapped). */
  isNative: boolean | null
  /** Raw subgraph `amount` in wei when present, including `"0"` (18-decimal RBTC / WRBTC). */
  amountWei: string | null
  user: AuditLogUserRole
}

import type { EpochStatus, RequestStatus, RequestType } from '../types'

// ─── Display Types ───────────────────────────────────────────────────

export interface VaultMetricsDisplay {
  tvlFormatted: string
  apyFormatted: string
  navFormatted: string
  timestamp: number
}

export interface EpochDisplay {
  epochId: string
  status: EpochStatus
  statusSummary: string
  isAcceptingRequests: boolean
}

export interface UserPositionDisplay {
  rbtcBalanceFormatted: string
  vaultTokensFormatted: string
  positionValueFormatted: string
  percentOfVaultFormatted: string
  /** Raw bigint kept for form validation (amount <= balance) */
  vaultTokensRaw: bigint
  /** Raw bigint kept for form validation */
  rbtcBalanceRaw: bigint

  totalDepositedPrincipalFormatted: string
  totalDepositedPrincipalRaw: bigint
  /** Derived: positionValue - totalDepositedPrincipal (clamped to 0) */
  currentEarningsFormatted: string
  /** positionValue as "Total balance" — same underlying value, semantic alias */
  totalBalanceFormatted: string
  totalBalanceRaw: bigint
  /** Derived: ((positionValue - principal) / principal) * 100, or "0.00%" when principal is 0 */
  yieldPercentToDateFormatted: string

  fiatWalletBalance: string
  fiatVaultShares: string
  fiatPrincipalDeposited: string
  fiatCurrentEarnings: string
  fiatTotalBalance: string
}

export interface ActionEligibility {
  canDeposit: boolean
  canWithdraw: boolean
  depositBlockReason: string
  withdrawBlockReason: string
}

export interface ActiveRequestDisplay {
  id: string
  type: RequestType
  amountFormatted: string
  status: RequestStatus
  createdAtFormatted: string
  claimable: boolean
  lockedSharePriceFormatted: string | null
  finalizeId: string | null
  epochId: string | null
  batchRedeemId: string | null
  /** Date-only string for "Last updated on" (e.g. "21 May 2025"). */
  lastUpdatedFormatted: string
  /** Withdrawal: amount as shares; deposit: "—" until settled. */
  sharesFormatted: string
  /** USD equivalent for display; mock or null in UI-only scope. */
  usdEquivalentFormatted: string | null
}

export interface RequestHistoryRowDisplay {
  id: string
  type: RequestType
  amountFormatted: string
  status: RequestStatus
  createdAtFormatted: string
  finalizedAtFormatted: string | null
  submitTxShort: string | null
  finalizeTxShort: string | null
  submitTxFull: string | null
  finalizeTxFull: string | null
}

export interface PaginatedHistoryDisplay {
  rows: RequestHistoryRowDisplay[]
  total: number
  page: number
  limit: number
  totalPages: number
}

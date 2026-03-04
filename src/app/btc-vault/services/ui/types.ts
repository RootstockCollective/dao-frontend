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
}

export interface ActionEligibility {
  canDeposit: boolean
  canWithdraw: boolean
  depositBlockReason: string
  withdrawBlockReason: string
}

/** Result of eligibility check: can the user use the vault? */
export interface EligibilityResult {
  isEligible: boolean
  reason: string
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

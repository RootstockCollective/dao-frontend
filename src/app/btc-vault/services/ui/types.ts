import type { EpochStatus, PauseState, RequestStatus, RequestType } from '../types'
import type { BtcVaultHistoryStatusKey } from './api-types'

export const DISPLAY_REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
} as const

/** Human-readable label derived from `RequestType` for table display. */
export type DisplayRequestType = (typeof DISPLAY_REQUEST_TYPE_LABELS)[RequestType]

// --- Display Status ---

/**
 * Visual status shown in the transaction history table.
 * Same keys as API wire `displayStatus` (`BtcVaultHistoryStatusKey`); labels differ by context in mappers.
 */
export type DisplayStatus = BtcVaultHistoryStatusKey

export const DISPLAY_STATUS_LABELS = {
  open_to_claim: 'Ready to claim',
  pending: 'Pending',
  approved: 'Approved',
  claim_pending: 'Claim pending',
  successful: 'Successful',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
} as const

export type DisplayStatusLabel = (typeof DISPLAY_STATUS_LABELS)[DisplayStatus]

/** Withdrawal TX history UI strings for wire `claim_pending` and `successful` (SC claimable / claimed). */
export const WITHDRAWAL_TX_HISTORY_STATUS_LABELS = {
  claim_pending: 'Ready to withdraw',
  successful: 'Withdrawn',
} as const

export type WithdrawalTxHistoryStatusLabel =
  (typeof WITHDRAWAL_TX_HISTORY_STATUS_LABELS)[keyof typeof WITHDRAWAL_TX_HISTORY_STATUS_LABELS]

export type HistoryRowStatusLabel = DisplayStatusLabel | WithdrawalTxHistoryStatusLabel

export interface DisplayStatusResult {
  displayStatus: DisplayStatus
  displayStatusLabel: DisplayStatusLabel
}

// --- Filter Params ---

export interface HistoryFilterParams {
  type?: RequestType[]
  claimToken?: ('shares' | 'rbtc')[]
  status?: HistoryRowStatusLabel[]
}

// --- Display Types ---

export interface VaultMetricsDisplay {
  tvlFormatted: string
  apyFormatted: string
  pricePerShareFormatted: string
  timestamp: number
  /** Raw tvl bigint kept for fiat conversion calculations */
  tvlRaw: bigint
  /**
   * Chain spot NAV `(totalAssets * 1e18) / totalSupply` — rBTC wei per **raw** share basis (same units
   * as `VaultMetrics.pricePerShare`). Kept for deposit/withdraw estimates (pair with raw share amounts).
   * `pricePerShareFormatted` is per **1.0 human** share via `lockedSharePriceToNavPerHumanShareWei`.
   */
  pricePerShareRaw: bigint
  /** Optional TVL as percentage of total supply or similar; when absent UI shows "—". */
  tvlPercentFormatted?: string
}

export interface EpochDisplay {
  epochId: string
  status: EpochStatus
  statusSummary: string
  isAcceptingRequests: boolean
  /** Unix timestamp (seconds) when the epoch stops accepting requests. Used for countdown and "until" date. */
  endTime: number
  /** Date-only string for "deposits can be made until [date]" (e.g. "23 Feb 2025"). */
  closesAtFormatted: string
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

  fiatWalletBalance: string | null
  fiatVaultShares: string | null
  fiatPrincipalDeposited: string | null
  fiatCurrentEarnings: string | null
  fiatTotalBalance: string | null
}

export interface ActionEligibility {
  canDeposit: boolean
  canWithdraw: boolean
  depositBlockReason: string
  withdrawBlockReason: string
  pauseState?: PauseState
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
  /** Wire display status from history API; drives stepper "Approved" state when on-chain is still `pending`. */
  displayStatus?: DisplayStatus
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
  /** Mapped visual status for the table badge (6 variants). */
  displayStatus: DisplayStatus
  /** Human-readable label for the display status (type-aware for TX history withdrawals). */
  displayStatusLabel: HistoryRowStatusLabel
  /** USD equivalent of the amount (deposits only). `null` for withdrawals. */
  fiatAmountFormatted: string | null
  /** Whether the row represents rBTC (deposits) or vault share tokens (withdrawals). */
  claimTokenType: 'rbtc' | 'shares'
  /** Date-only string for the most recent status transition (e.g. "21 May 2025"). */
  updatedAtFormatted: string
}

export interface PaginatedHistoryDisplay {
  rows: RequestHistoryRowDisplay[]
  total: number
  page: number
  limit: number
  totalPages: number
  /** Present when client-side status filter ran; row count on the current page before filtering. */
  rawRowCountBeforeStatusFilter?: number
}

export interface RequestDetailDisplay extends ActiveRequestDisplay {
  typeLabel: string
  addressShort: string
  addressFull: string
  submitTxShort: string | null
  submitTxFull: string | null
  canCancel: boolean
}

// ─── Capital Allocation Display ──────────────────────────────────────

export interface CapitalCategoryDisplay {
  /** Category label (e.g. "Deployed capital"). */
  label: string
  /** Formatted rBTC amount (e.g. "0.52"). */
  amountFormatted: string
  /** Percentage of total capital (e.g. "50%"). */
  percentFormatted: string
  /** USD equivalent (e.g. "$12,345.00 USD"). */
  fiatAmountFormatted: string
}

export interface CapitalAllocationDisplay {
  categories: CapitalCategoryDisplay[]
  wallets: WalletBalanceDisplay[]
}

export interface WalletBalanceDisplay {
  /** Human-readable wallet label (e.g. "Fordefi 9"). */
  label: string
  /** Strategy platform name (e.g. "Nimbus"). */
  trackingPlatform: string
  /** External URL to the strategy platform. */
  trackingUrl: string
  /** Formatted rBTC balance (e.g. "9.99999"). */
  amountFormatted: string
  /** Formatted USD equivalent (e.g. "$282.00 USD"). */
  fiatAmountFormatted: string
  /** Formatted percentage of total (e.g. "0.5%"). */
  percentFormatted: string
  /** Optional link for the wallet label (e.g. Blockscout). */
  labelUrl?: string
}

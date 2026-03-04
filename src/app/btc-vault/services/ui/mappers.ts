import { formatEther } from 'viem'

import type {
  ClaimableInfo,
  EligibilityStatus,
  EpochState,
  PaginatedResult,
  PauseState,
  UserPosition,
  VaultMetrics,
  VaultRequest,
} from '../types'
import {
  ELIGIBILITY_REASON_DEPOSITS_PAUSED,
  ELIGIBILITY_REASON_ELIGIBLE,
  ELIGIBILITY_REASON_NOT_AUTHORIZED,
  ELIGIBILITY_REASON_WITHDRAWALS_PAUSED,
} from './eligibilityReasons'
import {
  formatApyPercent,
  formatCountdown,
  formatPercent,
  formatTimestamp,
  shortenTxHash,
} from './formatters'
import type {
  ActiveRequestDisplay,
  EligibilityResult,
  EpochDisplay,
  PaginatedHistoryDisplay,
  UserPositionDisplay,
  VaultMetricsDisplay,
} from './types'

/**
 * Maps raw vault metrics from the adapter into display-ready formatted strings.
 * @param raw - Raw vault metrics with bigint values
 * @returns Display object with formatted TVL, APY, and NAV strings
 */
export function toVaultMetricsDisplay(raw: VaultMetrics): VaultMetricsDisplay {
  return {
    tvlFormatted: formatEther(raw.tvl),
    apyFormatted: formatApyPercent(raw.apy),
    navFormatted: formatEther(raw.nav),
    timestamp: raw.timestamp,
  }
}

/**
 * Maps raw epoch state into a display object with a human-readable status summary.
 * @param raw - Raw epoch state from the adapter
 * @returns Display object with status summary and whether requests are being accepted
 */
export function toEpochDisplay(raw: EpochState): EpochDisplay {
  const isAcceptingRequests = raw.status === 'open'
  const statusSummary =
    raw.status === 'open'
      ? `Closes in ${formatCountdown(raw.endTime)}`
      : raw.status === 'claimable'
        ? `Settled ${formatTimestamp(raw.settledAt!)}`
        : raw.status.charAt(0).toUpperCase() + raw.status.slice(1)
  return { epochId: raw.epochId, status: raw.status, statusSummary, isAcceptingRequests }
}

/**
 * Maps raw user position into display-ready strings while preserving raw bigints for form validation.
 * @param raw - Raw user position with bigint balances
 * @returns Display object with formatted strings and raw bigint values
 */
export function toUserPositionDisplay(raw: UserPosition): UserPositionDisplay {
  return {
    rbtcBalanceFormatted: formatEther(raw.rbtcBalance),
    vaultTokensFormatted: formatEther(raw.vaultTokens),
    positionValueFormatted: formatEther(raw.positionValue),
    percentOfVaultFormatted: formatPercent(raw.percentOfVault),
    vaultTokensRaw: raw.vaultTokens,
    rbtcBalanceRaw: raw.rbtcBalance,
  }
}

/**
 * Determines whether the user can use the vault (eligible = KYB + deposits/withdrawals not paused).
 * Step order: not approved → deposits paused → withdrawals paused → eligible.
 *
 * @param pause - Current pause state for deposits and withdrawals
 * @param eligibility - User's eligibility status (e.g. KYC, allowlist)
 * @returns Object with isEligible and a reason string (use ELIGIBILITY_REASON_* constants for comparison)
 */
export function toActionEligibility(pause: PauseState, eligibility: EligibilityStatus): EligibilityResult {
  if (!eligibility.eligible) {
    return {
      isEligible: false,
      reason: eligibility.reason || ELIGIBILITY_REASON_NOT_AUTHORIZED,
    }
  }
  if (pause.deposits === 'paused') {
    return { isEligible: false, reason: ELIGIBILITY_REASON_DEPOSITS_PAUSED }
  }
  if (pause.withdrawals === 'paused') {
    return { isEligible: false, reason: ELIGIBILITY_REASON_WITHDRAWALS_PAUSED }
  }
  return { isEligible: true, reason: ELIGIBILITY_REASON_ELIGIBLE }
}

/**
 * Maps a vault request and optional claimable info into a display-ready active request object.
 * @param req - Raw vault request from the adapter
 * @param claimableInfo - Claimable status info, or null if the request is not in claimable state
 * @returns Display object with formatted amounts, dates, and claimable details
 */
export function toActiveRequestDisplay(
  req: VaultRequest,
  claimableInfo: ClaimableInfo | null,
): ActiveRequestDisplay {
  return {
    id: req.id,
    type: req.type,
    amountFormatted: formatEther(req.amount),
    status: req.status,
    createdAtFormatted: formatTimestamp(req.timestamps.created),
    claimable: claimableInfo?.claimable ?? false,
    lockedSharePriceFormatted:
      claimableInfo?.lockedSharePrice != null ? `${formatEther(claimableInfo.lockedSharePrice)}/share` : null,
    finalizeId: req.type === 'deposit' ? req.epochId : req.batchRedeemId,
    epochId: req.epochId,
    batchRedeemId: req.batchRedeemId,
  }
}

/**
 * Maps a paginated result of vault requests into display-ready history rows with formatted values and shortened tx hashes.
 * @param raw - Paginated result containing raw vault requests
 * @returns Paginated display object with formatted rows and pagination metadata
 */
export function toPaginatedHistoryDisplay(raw: PaginatedResult<VaultRequest>): PaginatedHistoryDisplay {
  return {
    rows: raw.data.map(req => ({
      id: req.id,
      type: req.type,
      amountFormatted: formatEther(req.amount),
      status: req.status,
      createdAtFormatted: formatTimestamp(req.timestamps.created),
      finalizedAtFormatted: req.timestamps.finalized ? formatTimestamp(req.timestamps.finalized) : null,
      submitTxShort: req.txHashes.submit ? shortenTxHash(req.txHashes.submit) : null,
      finalizeTxShort: req.txHashes.finalize ? shortenTxHash(req.txHashes.finalize) : null,
      submitTxFull: req.txHashes.submit ?? null,
      finalizeTxFull: req.txHashes.finalize ?? null,
    })),
    total: raw.total,
    page: raw.page,
    limit: raw.limit,
    totalPages: raw.totalPages,
  }
}

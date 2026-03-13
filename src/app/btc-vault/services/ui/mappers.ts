import { formatEther } from 'viem'

import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'
import Big from '@/lib/big'
import { RBTC } from '@/lib/constants'
import { formatCurrencyWithLabel, shortAddress } from '@/lib/utils'

import { ACTIVE_REQUEST_REASON, DEPOSIT_PAUSED_REASON, WITHDRAWAL_PAUSED_REASON } from '../constants'
import type {
  CapitalAllocation,
  ClaimableInfo,
  EligibilityStatus,
  EpochState,
  PaginatedResult,
  PauseState,
  RequestStatus,
  RequestType,
  UserPosition,
  VaultMetrics,
  VaultRequest,
  WalletBalance,
} from '../types'
import {
  formatApyPercent,
  formatCountdown,
  formatDateShort,
  formatPercent,
  formatTimestamp,
  MOCK_RBTC_USD_PRICE,
  shortenTxHash,
} from './formatters'
import type {
  ActionEligibility,
  ActiveRequestDisplay,
  CapitalAllocationDisplay,
  DisplayStatus,
  DisplayStatusResult,
  EpochDisplay,
  PaginatedHistoryDisplay,
  RequestDetailDisplay,
  UserPositionDisplay,
  VaultMetricsDisplay,
  WalletBalanceDisplay,
} from './types'
import { DISPLAY_STATUS_LABELS } from './types'

/**
 * Maps raw vault metrics from the adapter into display-ready formatted strings.
 * @param raw - Raw vault metrics with bigint values
 * @returns Display object with formatted TVL, APY, and Price Per Share strings
 */
export function toVaultMetricsDisplay(raw: VaultMetrics): VaultMetricsDisplay {
  return {
    tvlFormatted: formatEther(raw.tvl),
    apyFormatted: formatApyPercent(raw.apy),
    pricePerShareFormatted: formatEther(raw.pricePerShare),
    timestamp: raw.timestamp,
    pricePerShareRaw: raw.pricePerShare,
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
      : raw.status === 'claimable' && raw.settledAt != null
        ? `Settled ${formatTimestamp(raw.settledAt)}`
        : raw.status.charAt(0).toUpperCase() + raw.status.slice(1)
  return {
    epochId: raw.epochId,
    status: raw.status,
    statusSummary,
    isAcceptingRequests,
    endTime: raw.endTime,
    closesAtFormatted: formatDateShort(raw.endTime),
  }
}

/**
 * Maps raw user position into display-ready strings while preserving raw bigints for form validation.
 * Derives current earnings, yield %, total balance, and fiat amounts.
 * @param raw - Raw user position with bigint balances
 * @returns Display object with formatted strings, derived metrics, and raw bigint values
 */
export function toUserPositionDisplay(raw: UserPosition): UserPositionDisplay {
  const currentEarnings =
    raw.positionValue > raw.totalDepositedPrincipal ? raw.positionValue - raw.totalDepositedPrincipal : 0n

  // Integer math: (earnings * 10_000) / principal gives basis points, then divide by 100 for percent
  const yieldBps =
    raw.totalDepositedPrincipal > 0n ? (currentEarnings * 10_000n) / raw.totalDepositedPrincipal : 0n
  const yieldPercent = Number(yieldBps) / 100

  return {
    rbtcBalanceFormatted: formatSymbol(raw.rbtcBalance, RBTC),
    vaultTokensFormatted: formatSymbol(raw.vaultTokens, RBTC),
    positionValueFormatted: formatSymbol(raw.positionValue, RBTC),
    percentOfVaultFormatted: formatPercent(raw.percentOfVault),
    vaultTokensRaw: raw.vaultTokens,
    rbtcBalanceRaw: raw.rbtcBalance,

    totalDepositedPrincipalFormatted: formatSymbol(raw.totalDepositedPrincipal, RBTC),
    totalDepositedPrincipalRaw: raw.totalDepositedPrincipal,
    currentEarningsFormatted: formatSymbol(currentEarnings, RBTC),
    totalBalanceFormatted: formatSymbol(raw.positionValue, RBTC),
    totalBalanceRaw: raw.positionValue,
    yieldPercentToDateFormatted: formatPercent(yieldPercent),

    fiatWalletBalance: formatCurrencyWithLabel(getFiatAmount(raw.rbtcBalance, MOCK_RBTC_USD_PRICE)),
    fiatVaultShares: formatCurrencyWithLabel(getFiatAmount(raw.positionValue, MOCK_RBTC_USD_PRICE)),
    fiatPrincipalDeposited: formatCurrencyWithLabel(
      getFiatAmount(raw.totalDepositedPrincipal, MOCK_RBTC_USD_PRICE),
    ),
    fiatCurrentEarnings: formatCurrencyWithLabel(getFiatAmount(currentEarnings, MOCK_RBTC_USD_PRICE)),
    fiatTotalBalance: formatCurrencyWithLabel(getFiatAmount(raw.positionValue, MOCK_RBTC_USD_PRICE)),
  }
}

/**
 * Consolidates pause state, eligibility, and active requests into a single action eligibility result.
 * Determines whether the user can deposit/withdraw and provides human-readable block reasons.
 * @param pause - Current pause state for deposits and withdrawals
 * @param eligibility - User's eligibility status (e.g. KYC, allowlist)
 * @param activeRequests - User's currently active vault requests
 * @returns Object with canDeposit/canWithdraw booleans and block reason strings
 */
export function toActionEligibility(
  pause: PauseState,
  eligibility: EligibilityStatus,
  activeRequests: VaultRequest[],
): ActionEligibility {
  const hasActive = activeRequests.length > 0
  const canDeposit = pause.deposits === 'active' && eligibility.eligible && !hasActive
  const canWithdraw = pause.withdrawals === 'active' && !hasActive
  return {
    canDeposit,
    canWithdraw,
    depositBlockReason: !eligibility.eligible
      ? eligibility.reason
      : pause.deposits === 'paused'
        ? DEPOSIT_PAUSED_REASON
        : hasActive
          ? ACTIVE_REQUEST_REASON
          : '',
    withdrawBlockReason:
      pause.withdrawals === 'paused' ? WITHDRAWAL_PAUSED_REASON : hasActive ? ACTIVE_REQUEST_REASON : '',
  }
}

/**
 * Maps a vault request and optional claimable info into a display-ready active request object.
 * @param req - Raw vault request from the adapter
 * @param claimableInfo - Claimable status info, or null if the request is not in claimable state
 * @param rbtcPrice - Current rBTC price in USD (0 if unavailable)
 * @returns Display object with formatted amounts, dates, and claimable details
 */
export function toActiveRequestDisplay(
  req: VaultRequest,
  claimableInfo: ClaimableInfo | null,
  rbtcPrice: number,
): ActiveRequestDisplay {
  const lastUpdated = req.timestamps.updated ?? req.timestamps.created
  const sharesFormatted = req.type === 'withdrawal' ? formatEther(req.amount) : '—'
  const amountNumber = Number(formatEther(req.amount))
  const usdEquivalentFormatted =
    rbtcPrice > 0 ? formatCurrencyWithLabel(Big(amountNumber).mul(rbtcPrice)) : null
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
    lastUpdatedFormatted: formatDateShort(lastUpdated),
    sharesFormatted,
    usdEquivalentFormatted,
  }
}

/**
 * Maps domain `RequestStatus` + `RequestType` + optional `failureReason` to a visual display status.
 * @param status - Domain request lifecycle status
 * @param type - Whether this is a deposit or withdrawal
 * @param failureReason - Optional reason for failure (cancelled vs rejected)
 * @returns Display status key and human-readable label
 */
export function mapRequestDisplayStatus(
  status: RequestStatus,
  type: RequestType,
  failureReason?: VaultRequest['failureReason'],
): DisplayStatusResult {
  let displayStatus: DisplayStatus

  switch (status) {
    case 'pending':
      displayStatus = 'pending'
      break
    case 'claimable':
      displayStatus = type === 'deposit' ? 'open_to_claim' : 'claim_pending'
      break
    case 'done':
      displayStatus = 'successful'
      break
    case 'failed':
    default:
      displayStatus = failureReason === 'rejected' ? 'rejected' : 'cancelled'
      break
    case 'cancelled':
      displayStatus = 'cancelled'
      break
  }

  return { displayStatus, displayStatusLabel: DISPLAY_STATUS_LABELS[displayStatus] }
}

/**
 * Maps a vault request into a detail-page display object, extending the active request display
 * with address, tx hash, and cancel eligibility fields.
 * @param req - Raw vault request from the adapter
 * @param claimableInfo - Claimable status info, or null
 * @param rbtcPrice - Current rBTC price in USD (0 if unavailable)
 * @param userAddress - Connected wallet address
 * @returns Display object with all fields needed for the transaction detail page
 */
export function toRequestDetailDisplay(
  req: VaultRequest,
  claimableInfo: ClaimableInfo | null,
  rbtcPrice: number,
  userAddress: string,
): RequestDetailDisplay {
  const base = toActiveRequestDisplay(req, claimableInfo, rbtcPrice)
  return {
    ...base,
    typeLabel: req.type === 'deposit' ? 'Deposit' : 'Withdrawal',
    // SAFETY: userAddress comes from useAccount which returns `0x${string}` at runtime
    addressShort: shortAddress(userAddress as `0x${string}`),
    addressFull: userAddress,
    submitTxShort: req.txHashes.submit ? shortenTxHash(req.txHashes.submit) : null,
    submitTxFull: req.txHashes.submit ?? null,
    canCancel: req.status === 'pending',
  }
}

/**
 * Maps a paginated result of vault requests into display-ready history rows with formatted values and shortened tx hashes.
 * @param raw - Paginated result containing raw vault requests
 * @param rbtcPrice - Current rBTC price in USD for fiat conversion
 * @returns Paginated display object with formatted rows and pagination metadata
 */
export function toPaginatedHistoryDisplay(
  raw: PaginatedResult<VaultRequest>,
  rbtcPrice = MOCK_RBTC_USD_PRICE,
): PaginatedHistoryDisplay {
  return {
    rows: raw.data.map(req => {
      const { displayStatus, displayStatusLabel } = mapRequestDisplayStatus(
        req.status,
        req.type,
        req.failureReason,
      )
      const isDeposit = req.type === 'deposit'
      const amountNumber = Number(formatEther(req.amount))
      const fiatAmountFormatted =
        isDeposit && rbtcPrice > 0 ? formatCurrencyWithLabel(Big(amountNumber).mul(rbtcPrice)) : null

      const updatedAt = req.timestamps.updated ?? req.timestamps.created

      return {
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
        displayStatus,
        displayStatusLabel,
        fiatAmountFormatted,
        claimTokenType: isDeposit ? ('rbtc' as const) : ('shares' as const),
        updatedAtFormatted: formatDateShort(updatedAt),
      }
    }),
    total: raw.total,
    page: raw.page,
    limit: raw.limit,
    totalPages: raw.totalPages,
  }
}

/**
 * Maps a single raw wallet balance into display-ready formatted strings.
 * @param wallet - Raw wallet balance with bigint amount
 * @param rbtcPrice - Current rBTC price in USD (0 if unavailable)
 * @returns Display object with formatted balance, fiat, and percentage
 */
export function toWalletBalanceDisplay(wallet: WalletBalance, rbtcPrice: number): WalletBalanceDisplay {
  const amountEther = formatEther(wallet.amount)
  const fiatAmountFormatted =
    rbtcPrice > 0 ? formatCurrencyWithLabel(Big(amountEther).mul(rbtcPrice)) : '$0.00 USD'
  return {
    label: wallet.label,
    trackingPlatform: wallet.trackingPlatform,
    trackingUrl: wallet.trackingUrl,
    amountFormatted: amountEther,
    fiatAmountFormatted,
    percentFormatted: `${wallet.percentOfTotal}%`,
  }
}

/**
 * Maps raw capital allocation data into display-ready formatted strings.
 * @param raw - Raw capital allocation with bigint amounts
 * @param rbtcPrice - Current rBTC price in USD (0 if unavailable)
 * @returns Display object with formatted categories and wallets
 */
export function toCapitalAllocationDisplay(
  raw: CapitalAllocation,
  rbtcPrice: number,
): CapitalAllocationDisplay {
  return {
    categories: raw.categories.map(cat => {
      const amountEther = formatEther(cat.amount)
      const percent = raw.totalCapital > 0n ? Number((cat.amount * 10000n) / raw.totalCapital) / 100 : 0
      const fiatAmountFormatted =
        rbtcPrice > 0 ? formatCurrencyWithLabel(Big(amountEther).mul(rbtcPrice)) : '$0.00 USD'
      return {
        label: cat.label,
        amountFormatted: amountEther,
        percentFormatted: `${percent}%`,
        fiatAmountFormatted,
      }
    }),
    wallets: raw.wallets.map(w => toWalletBalanceDisplay(w, rbtcPrice)),
  }
}

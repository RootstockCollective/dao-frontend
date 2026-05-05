import { DEPOSIT_ACTIONS } from '@/app/api/btc-vault/v1/schemas'
import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'
import { RBTC } from '@/lib/constants'
import {
  formatCurrencyWithLabel,
  formatDateDayFirst,
  formatDateMonthFirst,
  formatPercentage,
  shortAddress,
} from '@/lib/utils'

import {
  ACTIVE_REQUEST_REASON,
  DEPOSIT_ELIGIBILITY_LOADING_REASON,
  DEPOSIT_PAUSED_REASON,
  DEPOSIT_WHITELIST_BLOCK_REASON,
  NO_VAULT_SHARES_REASON,
  WITHDRAWAL_ELIGIBILITY_LOADING_REASON,
  WITHDRAWAL_PAUSED_REASON,
  WITHDRAWAL_WHITELIST_BLOCK_REASON,
} from '../constants'
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
import { lockedSharePriceFromEpochSnapshot, lockedSharePriceToNavPerHumanShareWei } from '../vaultShareNav'
import type { BtcVaultHistoryApiResponse, BtcVaultHistoryItemWithStatus } from './api-types'
import { formatApyPercent, formatCountdown, shortenTxHash } from './formatters'
import type {
  ActionEligibility,
  ActiveRequestDisplay,
  CapitalAllocationDisplay,
  DisplayStatus,
  DisplayStatusResult,
  EpochDisplay,
  HistoryRowStatusLabel,
  PaginatedHistoryDisplay,
  RequestDetailDisplay,
  RequestHistoryRowDisplay,
  UserPositionDisplay,
  VaultMetricsDisplay,
  WalletBalanceDisplay,
} from './types'
import { DISPLAY_STATUS_LABELS, WITHDRAWAL_TX_HISTORY_STATUS_LABELS } from './types'

const WEI_PER_ETHER = 10n ** 18n

const DISPLAY_STATUS_TO_REQUEST_STATUS = new Map<DisplayStatus, RequestStatus>([
  ['pending', 'pending'],
  ['approved', 'pending'],
  ['open_to_claim', 'claimable'],
  ['claim_pending', 'claimable'],
  ['successful', 'done'],
  ['cancelled', 'cancelled'],
  ['rejected', 'failed'],
])

const CLAIMABLE_DISPLAY_BY_TYPE = new Map<RequestType, DisplayStatus>([
  ['deposit', 'open_to_claim'],
  ['withdrawal', 'claim_pending'],
])

const WITHDRAWAL_TX_HISTORY_LABEL_OVERRIDES = new Map<DisplayStatus, HistoryRowStatusLabel>([
  ['claim_pending', WITHDRAWAL_TX_HISTORY_STATUS_LABELS.claim_pending],
  ['successful', WITHDRAWAL_TX_HISTORY_STATUS_LABELS.successful],
])

const DISPLAY_STATUS_TO_FAILURE_REASON = new Map<DisplayStatus, NonNullable<VaultRequest['failureReason']>>([
  ['rejected', 'rejected'],
  ['cancelled', 'cancelled'],
])

interface RequestDisplayContext {
  type: RequestType
  failureReason?: VaultRequest['failureReason']
}

const REQUEST_STATUS_TO_DISPLAY_RESOLVER = new Map<
  RequestStatus,
  (ctx: RequestDisplayContext) => DisplayStatus
>([
  ['pending', () => 'pending'],
  ['done', () => 'successful'],
  ['cancelled', () => 'cancelled'],
  ['claimable', ({ type }) => CLAIMABLE_DISPLAY_BY_TYPE.get(type) ?? 'claim_pending'],
  ['failed', ({ failureReason }) => (failureReason === 'rejected' ? 'rejected' : 'cancelled')],
])

/**
 * Maps raw vault metrics from the adapter into display-ready formatted strings.
 * @param raw - Raw vault metrics with bigint values
 * @returns Display object with formatted TVL, APY, and Price Per Share strings
 */
export function toVaultMetricsDisplay(raw: VaultMetrics): VaultMetricsDisplay {
  const pricePerShareHumanWei = lockedSharePriceToNavPerHumanShareWei(raw.pricePerShare)
  return {
    tvlFormatted: formatSymbol(raw.tvl, RBTC),
    apyFormatted: formatApyPercent(raw.apy),
    pricePerShareFormatted: formatSymbol(pricePerShareHumanWei, RBTC),
    timestamp: raw.timestamp,
    tvlRaw: raw.tvl,
    pricePerShareRaw: raw.pricePerShare,
    // tvlPercentFormatted omitted until we can measure TVL variation; UI hides the slot
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
        ? `Settled ${formatDateDayFirst(raw.settledAt)}`
        : raw.status.charAt(0).toUpperCase() + raw.status.slice(1)
  return {
    epochId: raw.epochId,
    status: raw.status,
    statusSummary,
    isAcceptingRequests,
    endTime: raw.endTime,
    closesAtFormatted: formatDateDayFirst(raw.endTime),
  }
}

/**
 * Maps raw user position into display-ready strings while preserving raw bigints for form validation.
 * Derives current earnings, yield %, total balance, and fiat amounts.
 * @param raw - Raw user position with bigint balances
 * @param rbtcPrice - Current rBTC price in USD (0 or negative if unavailable)
 * @returns Display object with formatted strings, derived metrics, and raw bigint values
 */
export function toUserPositionDisplay(raw: UserPosition, rbtcPrice: number): UserPositionDisplay {
  const currentEarnings =
    raw.positionValue > raw.totalDepositedPrincipal ? raw.positionValue - raw.totalDepositedPrincipal : 0n

  // Integer math: (earnings * 10_000) / principal gives basis points, then divide by 100 for percent
  const yieldBps =
    raw.totalDepositedPrincipal > 0n ? (currentEarnings * 10_000n) / raw.totalDepositedPrincipal : 0n
  const yieldPercent = Number(yieldBps) / 100

  const hasFiat = rbtcPrice > 0

  return {
    rbtcBalanceFormatted: formatSymbol(raw.rbtcBalance, RBTC),
    vaultTokensFormatted: formatSymbol(raw.vaultTokens, 'ctokenvault'),
    positionValueFormatted: formatSymbol(raw.positionValue, RBTC),
    percentOfVaultFormatted: formatPercentage(raw.percentOfVault),
    vaultTokensRaw: raw.vaultTokens,
    rbtcBalanceRaw: raw.rbtcBalance,

    totalDepositedPrincipalFormatted: formatSymbol(raw.totalDepositedPrincipal, RBTC),
    totalDepositedPrincipalRaw: raw.totalDepositedPrincipal,
    currentEarningsFormatted: formatSymbol(currentEarnings, RBTC),
    totalBalanceFormatted: formatSymbol(raw.positionValue, RBTC),
    totalBalanceRaw: raw.positionValue,
    yieldPercentToDateFormatted: formatPercentage(yieldPercent),

    fiatWalletBalance: hasFiat ? formatCurrencyWithLabel(getFiatAmount(raw.rbtcBalance, rbtcPrice)) : null,
    fiatVaultShares: hasFiat ? formatCurrencyWithLabel(getFiatAmount(raw.positionValue, rbtcPrice)) : null,
    fiatPrincipalDeposited: hasFiat
      ? formatCurrencyWithLabel(getFiatAmount(raw.totalDepositedPrincipal, rbtcPrice))
      : null,
    fiatCurrentEarnings: hasFiat ? formatCurrencyWithLabel(getFiatAmount(currentEarnings, rbtcPrice)) : null,
    fiatTotalBalance: hasFiat ? formatCurrencyWithLabel(getFiatAmount(raw.positionValue, rbtcPrice)) : null,
  }
}

/**
 * Consolidates pause state, eligibility, active requests, vault share balance, and optional
 * whitelist resolution into action eligibility.
 * Determines whether the user can deposit/withdraw and provides human-readable block reasons.
 * When `isWhitelisted` is provided, it gates both deposit and withdrawal (loading / not whitelisted).
 * When `isWhitelisted` is omitted, eligibility alone gates both actions (legacy callers).
 * @param pause - Current pause state for deposits and withdrawals
 * @param eligibility - User's eligibility status (e.g. KYC)
 * @param activeRequests - User's currently active vault requests
 * @param hasVaultShares - Whether the user holds a non-zero vault share balance (`balanceOf` > 0)
 * @param isWhitelisted - When provided: `false` blocks deposit/withdraw with whitelist copy; `null` blocks while loading; `true` applies pause/eligibility/active rules
 * @returns Object with canDeposit/canWithdraw, hasVaultShares, and block reason strings
 */
export function toActionEligibility(
  pause: PauseState,
  eligibility: EligibilityStatus,
  activeRequests: VaultRequest[],
  hasVaultShares: boolean,
  isWhitelisted?: boolean | null,
): ActionEligibility {
  const hasActive = activeRequests.length > 0

  const withdrawBlockReason = !eligibility.eligible
    ? eligibility.reason
    : pause.withdrawals === 'paused'
      ? WITHDRAWAL_PAUSED_REASON
      : hasActive
        ? ACTIVE_REQUEST_REASON
        : !hasVaultShares
          ? NO_VAULT_SHARES_REASON
          : ''

  const canWithdraw = pause.withdrawals === 'active' && eligibility.eligible && !hasActive && hasVaultShares

  if (isWhitelisted === undefined) {
    const canDeposit = pause.deposits === 'active' && eligibility.eligible && !hasActive
    const depositBlockReason = !eligibility.eligible
      ? eligibility.reason
      : pause.deposits === 'paused'
        ? DEPOSIT_PAUSED_REASON
        : hasActive
          ? ACTIVE_REQUEST_REASON
          : ''

    return {
      canDeposit,
      canWithdraw,
      hasVaultShares,
      depositBlockReason,
      withdrawBlockReason,
      pauseState: pause,
    }
  }

  if (isWhitelisted === null) {
    return {
      canDeposit: false,
      canWithdraw: false,
      hasVaultShares,
      depositBlockReason: DEPOSIT_ELIGIBILITY_LOADING_REASON,
      withdrawBlockReason: WITHDRAWAL_ELIGIBILITY_LOADING_REASON,
      pauseState: pause,
    }
  }

  if (isWhitelisted === false) {
    return {
      canDeposit: false,
      canWithdraw: false,
      hasVaultShares,
      depositBlockReason: DEPOSIT_WHITELIST_BLOCK_REASON,
      withdrawBlockReason: WITHDRAWAL_WHITELIST_BLOCK_REASON,
      pauseState: pause,
    }
  }

  const canDeposit = pause.deposits === 'active' && eligibility.eligible && !hasActive
  const depositBlockReason = !eligibility.eligible
    ? eligibility.reason
    : pause.deposits === 'paused'
      ? DEPOSIT_PAUSED_REASON
      : hasActive
        ? ACTIVE_REQUEST_REASON
        : ''

  return {
    canDeposit,
    canWithdraw,
    hasVaultShares,
    depositBlockReason,
    withdrawBlockReason,
    pauseState: pause,
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
  const hasSharePrice = claimableInfo?.lockedSharePrice != null && claimableInfo.lockedSharePrice > 0n

  const sharesFormatted =
    req.type === 'withdrawal'
      ? formatSymbol(req.amount, 'ctokenvault')
      : hasSharePrice
        ? formatSymbol((req.amount * WEI_PER_ETHER) / claimableInfo!.lockedSharePrice, 'ctokenvault')
        : '—'

  // Withdrawals: rBTC from epoch snapshot proportion — same as shares × NAV with on-chain rounding:
  // `(shares * (assetsAtClose+1)) / (supplyAtClose+1)`. `supplyAtClose` must use the same raw share units as `req.amount`.
  // Fallback to `lockedSharePrice` when snapshot totals are absent (tests / legacy).
  // Withdrawals without epoch data must show '—': `req.amount` is 24-decimal shares, not 18-decimal rBTC.
  const amountWei: bigint | null =
    req.type === 'withdrawal' && hasSharePrice
      ? (() => {
          const a = claimableInfo!.assetsAtCloseWei
          const s = claimableInfo!.supplyAtCloseWei
          if (a != null && s != null && s + 1n > 0n) {
            return (req.amount * lockedSharePriceFromEpochSnapshot(a, s)) / WEI_PER_ETHER
          }
          return (req.amount * claimableInfo!.lockedSharePrice) / WEI_PER_ETHER
        })()
      : req.type === 'withdrawal'
        ? null
        : req.amount

  const amountFormatted = amountWei != null ? formatSymbol(amountWei, RBTC) : '—'

  const usdEquivalentFormatted =
    amountWei != null && amountWei > 0n && rbtcPrice > 0
      ? formatCurrencyWithLabel(getFiatAmount(amountWei, rbtcPrice))
      : null
  return {
    id: req.id,
    type: req.type,
    amountFormatted,
    status: req.status,
    createdAtFormatted: formatDateDayFirst(req.timestamps.created),
    claimable: claimableInfo?.claimable ?? false,
    lockedSharePriceFormatted:
      claimableInfo?.lockedSharePrice != null
        ? `${formatSymbol(lockedSharePriceToNavPerHumanShareWei(claimableInfo.lockedSharePrice), RBTC)}/share`
        : null,
    finalizeId: req.type === 'deposit' ? req.epochId : req.batchRedeemId,
    epochId: req.epochId,
    batchRedeemId: req.batchRedeemId,
    lastUpdatedFormatted: formatDateDayFirst(lastUpdated),
    sharesFormatted,
    usdEquivalentFormatted,
    ...(req.displayStatus && { displayStatus: req.displayStatus }),
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
  const displayStatus =
    REQUEST_STATUS_TO_DISPLAY_RESOLVER.get(status)?.({ type, failureReason }) ?? 'cancelled'

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
  const isApproved = req.displayStatus === 'approved'
  return {
    ...base,
    claimable: base.claimable || req.status === 'claimable',
    typeLabel: req.type === 'deposit' ? 'Deposit' : 'Withdrawal',
    // SAFETY: userAddress comes from useAccount which returns `0x${string}` at runtime
    addressShort: shortAddress(userAddress as `0x${string}`),
    addressFull: userAddress,
    submitTxShort: req.txHashes.submit ? shortenTxHash(req.txHashes.submit) : null,
    submitTxFull: req.txHashes.submit ?? null,
    canCancel: req.status === 'pending' && !isApproved,
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
  rbtcPrice = 0,
): PaginatedHistoryDisplay {
  return {
    rows: raw.data.map(req => {
      const { displayStatus, displayStatusLabel } = mapRequestDisplayStatus(
        req.status,
        req.type,
        req.failureReason,
      )
      const isDeposit = req.type === 'deposit'
      let amountFormatted: string
      let fiatAmountFormatted: string | null = null
      if (isDeposit) {
        amountFormatted = formatSymbol(req.amount, RBTC)
        if (rbtcPrice > 0) {
          fiatAmountFormatted = formatCurrencyWithLabel(getFiatAmount(req.amount, rbtcPrice))
        }
      } else {
        amountFormatted = formatSymbol(req.amount, 'ctokenvault')
      }

      const updatedAt = req.timestamps.updated ?? req.timestamps.created

      return {
        id: req.id,
        type: req.type,
        amountFormatted,
        status: req.status,
        createdAtFormatted: formatDateDayFirst(req.timestamps.created),
        finalizedAtFormatted: req.timestamps.finalized ? formatDateDayFirst(req.timestamps.finalized) : null,
        submitTxShort: req.txHashes.submit ? shortenTxHash(req.txHashes.submit) : null,
        finalizeTxShort: req.txHashes.finalize ? shortenTxHash(req.txHashes.finalize) : null,
        submitTxFull: req.txHashes.submit ?? null,
        finalizeTxFull: req.txHashes.finalize ?? null,
        displayStatus,
        displayStatusLabel,
        fiatAmountFormatted,
        claimTokenType: isDeposit ? ('rbtc' as const) : ('shares' as const),
        updatedAtFormatted: formatDateDayFirst(updatedAt),
      }
    }),
    total: raw.total,
    page: raw.page,
    limit: raw.limit,
    totalPages: raw.totalPages,
  }
}

/**
 * Maps a single API history item to VaultRequest and optional ClaimableInfo for use by TransactionDetailPage.
 * For claimable deposits, derives ClaimableInfo from the API's assets/shares fields so the detail page
 * can display the share count without additional contract reads.
 */
export function mapApiItemToVaultRequest(item: BtcVaultHistoryItemWithStatus): {
  request: VaultRequest
  claimableInfo: ClaimableInfo | null
} {
  const actionUpper = item.action.toUpperCase()
  const isDeposit = DEPOSIT_ACTIONS.includes(actionUpper)
  const type: RequestType = isDeposit ? 'deposit' : 'withdrawal'
  const amount = isDeposit ? BigInt(item.assets) : BigInt(item.shares)
  const displayStatus = item.displayStatus ?? 'pending'
  const status = displayStatusToRequestStatus(displayStatus)
  const txHash = item.transactionHash?.trim() || undefined
  const failureReason = DISPLAY_STATUS_TO_FAILURE_REASON.get(displayStatus)

  const request: VaultRequest = {
    id: item.id,
    type,
    amount,
    status,
    epochId: isDeposit ? item.epochId : null,
    batchRedeemId: isDeposit ? null : item.epochId,
    displayStatus,
    timestamps: {
      created: item.timestamp,
      updated: item.timestamp,
    },
    txHashes: { submit: txHash },
    ...(failureReason && { failureReason }),
  }

  return { request, claimableInfo: null }
}

/**
 * Collapses table/wire `DisplayStatus` into domain `RequestStatus` (stepper, cancel, finalize flows).
 * `approved` (SC accepted) is still before claimable, so it maps to domain `pending` same as wire `pending`.
 * `open_to_claim` / `claim_pending` map to `claimable` (user can finalize).
 */
function displayStatusToRequestStatus(displayStatus: DisplayStatus): RequestStatus {
  return DISPLAY_STATUS_TO_REQUEST_STATUS.get(displayStatus) ?? 'pending'
}

/**
 * Row label for TX history: `DISPLAY_STATUS_LABELS`, with withdrawal overrides for claimable/claimed wording.
 */
export function getTxHistoryStatusLabel(
  displayStatus: DisplayStatus,
  requestType: RequestType,
): HistoryRowStatusLabel {
  const override =
    requestType === 'withdrawal' ? WITHDRAWAL_TX_HISTORY_LABEL_OVERRIDES.get(displayStatus) : undefined
  return override ?? DISPLAY_STATUS_LABELS[displayStatus]
}

/**
 * Maps GET /api/btc-vault/v1/history response (data + pagination) to PaginatedHistoryDisplay.
 * Each row gets displayStatus, amountFormatted (assets for deposit_*, shares for redeem_*),
 * submitTxShort/submitTxFull from transactionHash, claimTokenType, and formatted dates.
 * Status filter is not applied here; the hook applies it client-side to rows.
 *
 * @param response - API response shape { data: BtcVaultHistoryItemWithStatus[], pagination }
 * @param rbtcPrice
 * @returns Display-ready paginated history for the table
 */
export function apiHistoryToPaginatedDisplay(
  response: BtcVaultHistoryApiResponse,
  rbtcPrice = 0,
): PaginatedHistoryDisplay {
  const { data, pagination } = response
  const rows: RequestHistoryRowDisplay[] = data.map(item => {
    const actionUpper = item.action.toUpperCase()
    const isDeposit = DEPOSIT_ACTIONS.includes(actionUpper)
    const type: RequestType = isDeposit ? 'deposit' : 'withdrawal'
    const amountWei = isDeposit ? BigInt(item.assets) : BigInt(item.shares)
    const displayStatus = item.displayStatus ?? 'pending'
    const displayStatusLabel = getTxHistoryStatusLabel(displayStatus, type)
    const status = displayStatusToRequestStatus(displayStatus)

    const txHash = item.transactionHash?.trim() || null
    return {
      id: item.id,
      type,
      amountFormatted: isDeposit ? formatSymbol(amountWei, RBTC) : formatSymbol(amountWei, 'ctokenvault'),
      status,
      createdAtFormatted: formatDateMonthFirst(item.timestamp),
      finalizedAtFormatted: null,
      submitTxShort: txHash ? shortenTxHash(txHash) : null,
      finalizeTxShort: null,
      submitTxFull: txHash,
      finalizeTxFull: null,
      displayStatus,
      displayStatusLabel,
      fiatAmountFormatted:
        isDeposit && rbtcPrice > 0 ? formatCurrencyWithLabel(getFiatAmount(amountWei, rbtcPrice)) : null,
      claimTokenType: isDeposit ? ('rbtc' as const) : ('shares' as const),
      updatedAtFormatted: formatDateDayFirst(item.timestamp),
    }
  })

  return {
    rows,
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.totalPages ?? Math.ceil(pagination.total / pagination.limit),
  }
}

/**
 * Maps a single raw wallet balance into display-ready formatted strings.
 * @param wallet - Raw wallet balance with bigint amount
 * @param rbtcPrice - Current rBTC price in USD (0 if unavailable)
 * @returns Display object with formatted balance, fiat, and percentage
 */
export function toWalletBalanceDisplay(wallet: WalletBalance, rbtcPrice: number): WalletBalanceDisplay {
  const fiatAmountFormatted =
    rbtcPrice > 0 ? formatCurrencyWithLabel(getFiatAmount(wallet.amount, rbtcPrice)) : '$0.00 USD'
  return {
    label: wallet.label,
    ...(wallet.labelUrl != null && wallet.labelUrl !== '' ? { labelUrl: wallet.labelUrl } : {}),
    trackingPlatform: wallet.trackingPlatform,
    trackingUrl: wallet.trackingUrl,
    amountFormatted: formatSymbol(wallet.amount, RBTC),
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
  const sumCategories = raw.categories.reduce((acc, cat) => acc + cat.amount, 0n)
  return {
    categories: raw.categories.map(cat => {
      const percent = sumCategories > 0n ? Number((cat.amount * 10000n) / sumCategories) / 100 : 0
      const fiatAmountFormatted =
        rbtcPrice > 0 ? formatCurrencyWithLabel(getFiatAmount(cat.amount, rbtcPrice)) : '$0.00 USD'
      return {
        label: cat.label,
        amountFormatted: formatSymbol(cat.amount, RBTC),
        percentFormatted: `${percent}%`,
        fiatAmountFormatted,
      }
    }),
    wallets: raw.wallets.map(w => toWalletBalanceDisplay(w, rbtcPrice)),
  }
}

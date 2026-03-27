import { formatPartAsPercentOfWhole } from './updateNavImpact'

/** Step change vs previous on-chain reported amount: warn when max/min is at least this multiple (inclusive). */
const STEP_CHANGE_MIN_MULTIPLE = 3n

/** User-facing multiplier label (e.g. "3×") — derived from `STEP_CHANGE_MIN_MULTIPLE`. */
export function stepChangeMinMultipleDisplay(): string {
  return `${STEP_CHANGE_MIN_MULTIPLE.toString()}×`
}

export interface ReportedOffchainWarningFmt {
  navBefore: string
  navAfter: string
  navDelta: string
  navDeltaPct: string | null
  currentReported: string
  newReported: string
  reportedDelta: string
  /** New reported as % of current NAV (e.g. "63.9%") */
  pctNewReportedOfNavBefore: string | null
}

export interface ReportedOffchainWarningContext {
  reportedWei: bigint
  currentReportedWei: bigint
  currentTotalAssetsWei: bigint
  isFirstNonZeroReport: boolean
  fmt: ReportedOffchainWarningFmt
}

/**
 * Heuristic warnings for reported off-chain updates (manager review only; does not block submit).
 * Thresholds unchanged; copy references formatted amounts from `fmt`.
 */
export function reportedOffchainWarningMessages(ctx: ReportedOffchainWarningContext): string[] {
  const { reportedWei, currentReportedWei, currentTotalAssetsWei, isFirstNonZeroReport, fmt } = ctx

  const messages: string[] = []

  if (currentTotalAssetsWei > 0n && reportedWei * 100n > currentTotalAssetsWei * 50n) {
    const pct =
      fmt.pctNewReportedOfNavBefore ?? formatPartAsPercentOfWhole(reportedWei, currentTotalAssetsWei)
    messages.push(
      `New reported off-chain assets equal ${pct} of current NAV (${fmt.navBefore}). Confirm this matches internal books before submitting.`,
    )
  }

  if (currentReportedWei > 0n && reportedWei > 0n) {
    const hi = reportedWei > currentReportedWei ? reportedWei : currentReportedWei
    const lo = reportedWei > currentReportedWei ? currentReportedWei : reportedWei
    if (lo > 0n && hi >= lo * STEP_CHANGE_MIN_MULTIPLE) {
      const navImpact =
        fmt.navDeltaPct !== null
          ? ` This update would move NAV from ${fmt.navBefore} to ${fmt.navAfter} (${fmt.navDeltaPct} from prior NAV).`
          : ` This update would move NAV from ${fmt.navBefore} to ${fmt.navAfter} (${fmt.navDelta} change).`
      messages.push(
        `The new reported amount (${fmt.newReported}) differs materially from the previous on-chain figure (${fmt.currentReported}, at least ${stepChangeMinMultipleDisplay()}).${navImpact}`,
      )
    }
  }

  if (
    isFirstNonZeroReport &&
    reportedWei > 0n &&
    currentTotalAssetsWei > 0n &&
    reportedWei * 100n <= currentTotalAssetsWei * 50n &&
    reportedWei * 100n > currentTotalAssetsWei * 30n
  ) {
    const pct =
      fmt.pctNewReportedOfNavBefore ?? formatPartAsPercentOfWhole(reportedWei, currentTotalAssetsWei)
    messages.push(
      `This is the first non-zero off-chain report for the vault. The new amount (${fmt.newReported}) is ${pct} of current NAV (${fmt.navBefore}). Verify before submitting.`,
    )
  }

  return messages
}

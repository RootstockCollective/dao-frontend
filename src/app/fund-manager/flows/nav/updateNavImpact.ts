/**
 * Bigint-safe helpers for Update NAV review: post-update NAV, deltas, and percentage strings.
 *
 * NAV identity: totalAssets (before) = vaultAssetBalance + reportedBefore − liabilities;
 * after update: navAfter = vaultAssetBalance + reportedNew − liabilities.
 * Hence: navAfter − navBefore = reportedNew − reportedBefore.
 */

/** Basis points: 10_000n = 100.00%. */
export const BPS_SCALE = 10_000n

export function computeNavAfterWei(
  vaultAssetBalance: bigint,
  reportedWei: bigint,
  liabilities: bigint,
): bigint {
  return vaultAssetBalance + reportedWei - liabilities
}

export function navDeltaWei(navBefore: bigint, navAfter: bigint): bigint {
  return navAfter - navBefore
}

export function reportedDeltaWei(reportedNew: bigint, reportedBefore: bigint): bigint {
  return reportedNew - reportedBefore
}

/** NAV % change vs prior NAV: (navDelta / navBefore) as basis points. Null if prior NAV is zero. */
export function navChangeBps(navDelta: bigint, navBefore: bigint): bigint | null {
  if (navBefore === 0n) return null
  return (navDelta * BPS_SCALE) / navBefore
}

/** What share of `whole` is `part`, in basis points (e.g. new reported vs current NAV). Null if whole is zero. */
export function partAsPercentOfWholeBps(part: bigint, whole: bigint): bigint | null {
  if (whole === 0n) return null
  return (part * BPS_SCALE) / whole
}

/**
 * Renders basis points as a percentage string with one decimal (e.g. 6390 → "63.9%").
 * Values are rounded half-up to the nearest tenth of a percent (10 bps), e.g. 6395 → "64.0%".
 * Negative values render with a leading minus.
 */
export function formatBpsAsPercent(bps: bigint): string {
  const sign = bps < 0n ? '-' : ''
  const abs = bps < 0n ? -bps : bps
  const rounded = ((abs + 5n) / 10n) * 10n
  const wholePart = rounded / 100n
  const tenth = (rounded % 100n) / 10n
  return `${sign}${wholePart}.${tenth}%`
}

/**
 * `part / whole` as a percentage string (one decimal), same pipeline as `partAsPercentOfWholeBps` + `formatBpsAsPercent`.
 * When `whole` is zero, bps are treated as 0 (`"0.0%"`).
 */
export function formatPartAsPercentOfWhole(part: bigint, whole: bigint): string {
  return formatBpsAsPercent(partAsPercentOfWholeBps(part, whole) ?? 0n)
}

/** Snapshot for Update NAV modal: display strings + `navBeforeWei` for edge-case UI (built with `formatMetrics`). */
export interface NavUpdateReview {
  navBeforeWei: bigint
  navBeforeDisplay: string
  navAfterDisplay: string
  navDeltaDisplay: string
  reportedBeforeDisplay: string
  reportedNewDisplay: string
  reportedDeltaDisplay: string
  navDeltaPctDisplay: string | null
  reportedPctOfNavBeforeDisplay: string | null
  navAfterFiatDisplay: string
  reportedNewFiatDisplay: string
}

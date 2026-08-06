import Big from '@/lib/big'

/**
 * `$421,000`. Cycle totals run into six figures, where cents are noise — and they'd be
 * false precision anyway, since the figure is re-valued at spot prices.
 */
export const formatUsdWhole = (value: Big | number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value.toString()))

/** `$2.14M`. For figures shown beside a token amount, where the exact dollar adds nothing. */
export const formatUsdCompact = (value: Big | number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(Number(value.toString()))

/**
 * `23 Jul`. Pinned to UTC because cycles are anchored to UTC on-chain; without it the same
 * cycle renders a day earlier for anyone west of Greenwich.
 */
export const formatCycleDay = (date: Date): string =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })

/** `23 Jul → 06 Aug` */
export const formatCycleWindow = (start: Date, end: Date): string =>
  `${formatCycleDay(start)} → ${formatCycleDay(end)}`

/** `64% / 36%` for a 0..1 backer share. */
export const formatSplitLabel = (backersShare: number): string =>
  `${Math.round(backersShare * 100)}% / ${Math.round((1 - backersShare) * 100)}%`

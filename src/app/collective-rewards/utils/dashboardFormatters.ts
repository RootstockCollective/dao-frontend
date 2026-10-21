import Big from '@/lib/big'

/** `$421,000` */
export const formatUsdWhole = (value: Big | number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value.toString()))

/** `$2.14M` */
export const formatUsdCompact = (value: Big | number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(Number(value.toString()))

/** `23 Jul`, in UTC so the window matches the on-chain cycle in every timezone. */
export const formatCycleDay = (date: Date): string =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })

/** `23 Jul → 06 Aug` */
export const formatCycleWindow = (start: Date, end: Date): string =>
  `${formatCycleDay(start)} → ${formatCycleDay(end)}`

/** `27.6M`. A fixed single decimal, unlike `millify`, so a column of totals lines up. */
export const formatBackingCompact = (value: Big | bigint | number): string => {
  const amount = Number(value.toString())
  const fractionDigits = Math.abs(amount) < 1_000 ? 0 : 1

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount)
}

/** The Builder side is the remainder, not rounded on its own, so the two always sum to 100. */
export const getSplitPercentages = (backersShare: number): { backersPct: number; buildersPct: number } => {
  const backersPct = Math.round(backersShare * 100)

  return { backersPct, buildersPct: 100 - backersPct }
}

/** `64% / 36%` for a 0..1 backer share. */
export const formatSplitLabel = (backersShare: number): string => {
  const { backersPct, buildersPct } = getSplitPercentages(backersShare)

  return `${backersPct}% / ${buildersPct}%`
}

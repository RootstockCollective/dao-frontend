import { formatEther, parseEther } from 'viem'

import Big from '@/lib/big'
import { ABI_BOOST_MIN_BACKING, ABI_BOOST_PERCENTAGE, ABI_BOOST_TERM_MONTHS } from '@/lib/constants'
import { formatNumberWithCommas } from '@/lib/utils'

/**
 * Whole-token amount to wei. Goes through Big's plain notation, since `Number#toString` switches
 * to exponents (`1e+21`, `1e-7`) that `parseEther` rejects.
 */
export const toWeiAmount = (amount: number): bigint => parseEther(Big(amount).toFixed())

/**
 * Terms of the ABI boost, read from a single place. Every label below derives from them, so no
 * screen carries its own copy of the minimum, the boost or the term.
 */
export const ABI_BOOST = {
  /** Minimum backing, in whole stRIF. */
  minBacking: ABI_BOOST_MIN_BACKING,
  /** Minimum backing, in wei. */
  minBackingWei: toWeiAmount(ABI_BOOST_MIN_BACKING),
  /** Percentage points added on top of the current ABI. */
  percentage: ABI_BOOST_PERCENTAGE,
  termMonths: ABI_BOOST_TERM_MONTHS,
} as const

/**
 * - `notEligible`: the wallet doesn't hold enough stRIF to reach the minimum backing
 * - `eligible`: it holds enough stRIF, but its backing is still under the minimum
 * - `active`: its backing is at or above the minimum, so the boost applies
 */
export type AbiBoostStatus = 'notEligible' | 'eligible' | 'active'

export interface AbiBoostPosition {
  /** stRIF balance, in wei. */
  stRifBalance: bigint
  /** Total stRIF backing Builders, in wei. */
  backing: bigint
}

export const getAbiBoostStatus = (
  { stRifBalance, backing }: AbiBoostPosition,
  minBacking: bigint = ABI_BOOST.minBackingWei,
): AbiBoostStatus => {
  if (backing >= minBacking) return 'active'
  if (stRifBalance >= minBacking) return 'eligible'
  return 'notEligible'
}

/** What is still missing to reach the minimum, in wei. Zero once it is reached. */
export const getMissingForAbiBoost = (
  amount: bigint,
  minBacking: bigint = ABI_BOOST.minBackingWei,
): bigint => (amount >= minBacking ? 0n : minBacking - amount)

/**
 * Backing exists but falls short of the minimum: it earns the regular ABI and never the boost.
 * An empty position is not "below the threshold", it simply has nothing to report.
 */
export const isBelowAbiBoostThreshold = (
  backing: bigint,
  minBacking: bigint = ABI_BOOST.minBackingWei,
): boolean => backing > 0n && backing < minBacking

/** The rate a boosted backing earns: the current ABI plus the boost, never a fixed figure. */
export const getBoostedRate = (currentAbi: Big, boost: number = ABI_BOOST.percentage): Big =>
  Big(currentAbi).plus(boost)

/** Rates keep one decimal, so 4.5% + 7.5% reads 12.0% and not 12%. */
export const formatRate = (rate: Big | number): string => `${Big(rate).toFixed(1)}%`

/** `7.5%`, trailing zeros dropped. */
export const formatAbiBoostPercentage = (boost: number = ABI_BOOST.percentage): string =>
  `${Big(boost).toFixedNoTrailing(2)}%`

export const formatAbiBoostTerm = (months: number = ABI_BOOST.termMonths): string =>
  `${months} ${months === 1 ? 'month' : 'months'}`

/**
 * `100,000 stRIF`. `exact` shows the amount as it is (up to two decimals, truncated); `up` rounds
 * to the next whole token, which is what a figure still missing to reach the minimum needs.
 */
export const formatAbiBoostAmount = (
  amount: number | string,
  symbol: string,
  rounding: 'exact' | 'up' = 'exact',
): string => {
  const value =
    rounding === 'up' ? Big(amount).round(0, Big.roundUp).toFixed() : Big(amount).toFixedNoTrailing(2, 0)
  return `${formatNumberWithCommas(value)} ${symbol}`
}

/** What is still missing to reach the minimum, from wei, rounded up to the next whole token. */
export const formatMissingAmount = (missingWei: bigint, symbol: string): string =>
  formatAbiBoostAmount(formatEther(missingWei), symbol, 'up')

/**
 * What the stake being typed means for the boost, judged on that amount alone, as the design has
 * it: at or above the minimum it qualifies once it backs a Builder, under it it doesn't.
 */
export type StakeBoostOutlook = 'eligible' | 'belowMinimum'

export const getStakeBoostOutlook = (
  amount: bigint,
  minBacking: bigint = ABI_BOOST.minBackingWei,
): StakeBoostOutlook => (amount >= minBacking ? 'eligible' : 'belowMinimum')

/**
 * What stands between the wallet and the boost:
 * - `active`: nothing, it's running
 * - `backMore`: the wallet holds enough stRIF, `missing` is what it still has to allocate
 * - `stakeMore`: it doesn't hold enough, `missing` is the stRIF it lacks
 */
export type AbiBoostGuidance =
  | { kind: 'active' }
  | { kind: 'backMore'; missing: bigint }
  | { kind: 'stakeMore'; missing: bigint }

export const getAbiBoostGuidance = (
  position: AbiBoostPosition,
  minBacking: bigint = ABI_BOOST.minBackingWei,
): AbiBoostGuidance => {
  switch (getAbiBoostStatus(position, minBacking)) {
    case 'active':
      return { kind: 'active' }
    case 'eligible':
      return { kind: 'backMore', missing: getMissingForAbiBoost(position.backing, minBacking) }
    case 'notEligible':
      return { kind: 'stakeMore', missing: getMissingForAbiBoost(position.stRifBalance, minBacking) }
  }
}

/**
 * How a backing about to be saved (`next`) compares with the one on-chain (`current`):
 * - `active`: both reach the minimum, the boost keeps running
 * - `willActivate`: saving switches the boost on
 * - `willDeactivate`: saving drops the backing under the minimum and switches the boost off
 * - `missing`: an unsaved backing still short of the minimum, by `missing`
 * - `belowThreshold`: a saved backing short of the minimum, which earns no boost
 * - `null`: no backing at all, nothing to say
 */
export type BackingBoostHintState =
  | { kind: 'active' }
  | { kind: 'willActivate' }
  | { kind: 'willDeactivate' }
  | { kind: 'missing'; missing: bigint }
  | { kind: 'belowThreshold' }
  | null

export const getBackingBoostHint = (
  current: bigint,
  next: bigint,
  minBacking: bigint = ABI_BOOST.minBackingWei,
): BackingBoostHintState => {
  const isCurrentBoosted = current >= minBacking
  if (next >= minBacking) return { kind: isCurrentBoosted ? 'active' : 'willActivate' }
  if (next <= 0n) return isCurrentBoosted ? { kind: 'willDeactivate' } : null
  if (isCurrentBoosted) return { kind: 'willDeactivate' }
  if (next === current) return { kind: 'belowThreshold' }
  return { kind: 'missing', missing: getMissingForAbiBoost(next, minBacking) }
}

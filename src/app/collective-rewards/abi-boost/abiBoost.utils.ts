import { formatEther, parseEther } from 'viem'

import Big from '@/lib/big'
import { ABI_BOOST_MIN_BACKING, ABI_BOOST_PERCENTAGE, ABI_BOOST_TERM_MONTHS } from '@/lib/constants'
import { formatNumberWithCommas } from '@/lib/utils'

// Via Big's plain notation: Number#toString switches to exponents (1e+21) that parseEther rejects
export const toWeiAmount = (amount: number): bigint => parseEther(Big(amount).toFixed())

export const ABI_BOOST = {
  minBacking: ABI_BOOST_MIN_BACKING,
  minBackingWei: toWeiAmount(ABI_BOOST_MIN_BACKING),
  percentage: ABI_BOOST_PERCENTAGE,
  termMonths: ABI_BOOST_TERM_MONTHS,
} as const

export type AbiBoostStatus = 'notEligible' | 'eligible' | 'active'

export interface AbiBoostPosition {
  stRifBalance: bigint
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

export const getMissingForAbiBoost = (
  amount: bigint,
  minBacking: bigint = ABI_BOOST.minBackingWei,
): bigint => (amount >= minBacking ? 0n : minBacking - amount)

export const isBelowAbiBoostThreshold = (
  backing: bigint,
  minBacking: bigint = ABI_BOOST.minBackingWei,
): boolean => backing > 0n && backing < minBacking

export const getBoostedRate = (currentAbi: Big, boost: number = ABI_BOOST.percentage): Big =>
  Big(currentAbi).plus(boost)

export const formatRate = (rate: Big | number): string => `${Big(rate).toFixed(1)}%`

export const formatAbiBoostPercentage = (boost: number = ABI_BOOST.percentage): string =>
  `${Big(boost).toFixedNoTrailing(2)}%`

export const formatAbiBoostTerm = (months: number = ABI_BOOST.termMonths): string =>
  `${months} ${months === 1 ? 'month' : 'months'}`

export const formatAbiBoostAmount = (
  amount: number | string,
  symbol: string,
  rounding: 'exact' | 'up' = 'exact',
): string => {
  const value =
    rounding === 'up' ? Big(amount).round(0, Big.roundUp).toFixed() : Big(amount).toFixedNoTrailing(2, 0)
  return `${formatNumberWithCommas(value)} ${symbol}`
}

export const formatMissingAmount = (missingWei: bigint, symbol: string): string =>
  formatAbiBoostAmount(formatEther(missingWei), symbol, 'up')

export type StakeBoostOutlook = 'eligible' | 'belowMinimum'

export const getStakeBoostOutlook = (
  amount: bigint,
  minBacking: bigint = ABI_BOOST.minBackingWei,
): StakeBoostOutlook => (amount >= minBacking ? 'eligible' : 'belowMinimum')

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

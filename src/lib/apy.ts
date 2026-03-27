import Big from '@/lib/big'

import { SECONDS_PER_YEAR } from './constants'

/**
 * Computes the annual percentage yield (APY) from a growth factor over a period.
 *
 * @param growthFactor - Per-second rate (when periodSeconds=1) or cumulative price ratio (otherwise)
 * @param periodSeconds - The period duration in seconds
 * @returns The APY as a decimal (e.g. 0.05 for 5%), or NaN if inputs are invalid (non-finite or negative growth, non-positive period)
 */
export function growthFactorToApy(growthFactor: number, periodSeconds: number): number {
  if (!Number.isFinite(growthFactor) || !Number.isFinite(periodSeconds) || periodSeconds <= 0) {
    return NaN
  }
  const growthPerPeriod = periodSeconds === 1 ? 1 + growthFactor : growthFactor
  if (growthPerPeriod <= 0) {
    return NaN
  }
  const periodsPerYear = SECONDS_PER_YEAR / periodSeconds
  return Math.exp(periodsPerYear * Math.log(growthPerPeriod)) - 1
}

export interface EpochSnapshot {
  closedAt: bigint
  assetsAtClose: bigint
  supplyAtClose: bigint
}

/**
 * Computes an indicative APY from two consecutive epoch snapshots.
 *
 * Share price per spec: sharePrice(n) = epochTotalAssets[n] / epochTotalSupply[n]
 * (i.e. assetsAtClose / supplyAtClose). APY = (priceNew / priceOld)^(SECONDS_PER_YEAR / elapsed) − 1.
 *
 * @returns APY as a decimal (e.g. 0.05 for 5%), or null when not computable.
 */
export function computeIndicativeApy(
  currentEpoch: EpochSnapshot | null,
  prevEpoch: EpochSnapshot | null,
): number | null {
  if (!currentEpoch || !prevEpoch) return null
  if (currentEpoch.supplyAtClose === 0n || prevEpoch.supplyAtClose === 0n) return null

  const elapsed = currentEpoch.closedAt - prevEpoch.closedAt
  if (elapsed <= 0n) return null

  const sharePriceNow = Big(currentEpoch.assetsAtClose.toString()).div(currentEpoch.supplyAtClose.toString())
  const sharePricePrev = Big(prevEpoch.assetsAtClose.toString()).div(prevEpoch.supplyAtClose.toString())

  if (sharePricePrev.eq(0)) return null

  const priceRatio = Number(sharePriceNow.div(sharePricePrev).toString())
  const apy = growthFactorToApy(priceRatio, Number(elapsed))

  if (!Number.isFinite(apy)) return null
  return apy
}

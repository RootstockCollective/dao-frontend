import { SECONDS_PER_YEAR } from '@/lib/constants'

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
  const periodsPerYear = Number(SECONDS_PER_YEAR) / periodSeconds
  return Math.exp(periodsPerYear * Math.log(growthPerPeriod)) - 1
}

/**
 * Computes the annual percentage yield (APY) from a rate per second.
 * @param ratePerSecond - The rate per second
 * @returns The APY as a decimal (e.g. 0.05 for 5%), or NaN if inputs are invalid (non-finite or negative growth, non-positive period)
 */
export function ratePerSecondToApy(ratePerSecond: number): number {
  return growthFactorToApy(ratePerSecond, 1)
}

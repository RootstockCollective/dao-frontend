import Big from '@/lib/big'

/** Show warning when user loses more than 5%: output below 95% of input. */
const MIN_OUTPUT_FRACTION = 0.95

/**
 * Exact copy for the low-liquidity warning message (product requirement).
 */
export const LOW_LIQUIDITY_WARNING_MESSAGE =
  'Warning: there is not enough liquidity to swap the full amount. Please double check you are happy with the amounts shown prior to swapping.'

/**
 * Returns true when the user would lose more than 5% of their input (output < 95% of input).
 * E.g. in=100: out=94.99 → show; out=95.01 → don't show.
 * Requires both amounts present and positive to avoid flashing during loading or empty state.
 *
 * @param amountIn - Input amount (user-typed in exactIn, from quote in exactOut)
 * @param amountOut - Output amount (from quote in exactIn, user-typed in exactOut)
 * @returns true if amountOut < 95% of amountIn (i.e. loss > 5%)
 */
export function shouldShowLowLiquidityWarning(amountIn: string, amountOut: string): boolean {
  if (!amountIn || !amountOut) return false
  const inVal = new Big(amountIn)
  const outVal = new Big(amountOut)
  if (!inVal.gt(0)) return false
  return outVal.lt(inVal.times(MIN_OUTPUT_FRACTION))
}

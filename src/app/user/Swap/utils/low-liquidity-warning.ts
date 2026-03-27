import Big from '@/lib/big'

/** Show warning when user loses more than 5%: output below 95% of input. */
const MIN_OUTPUT_FRACTION = 0.95

/**
 * Exact copy for the low-liquidity warning message (product requirement).
 */
export const LOW_LIQUIDITY_WARNING_MESSAGE =
  'Warning: there is not enough liquidity to swap the full amount. Please double check you are happy with the amounts shown prior to swapping.'

/**
 * Returns true when effective output value is more than ~5% below input value.
 *
 * When **both** `priceInUsd` and `priceOutUsd` are defined and &gt; 0, compares
 * **USD notionals** (same logic as the fiat line under each field). Use this for
 * arbitrary pairs (e.g. RIF → USDRIF): raw token amounts are not comparable.
 *
 * Otherwise falls back to comparing **human amounts only** — only meaningful for
 * ~1:1 stable-style pairs (legacy USDT0 ↔ USDRIF behaviour when prices are missing).
 *
 * @param amountIn - Human-readable input amount
 * @param amountOut - Human-readable quoted output amount
 * @param priceInUsd - Optional USD price per 1 unit of token in (from balances context)
 * @param priceOutUsd - Optional USD price per 1 unit of token out
 */
export function shouldShowLowLiquidityWarning(
  amountIn: string,
  amountOut: string,
  priceInUsd?: number,
  priceOutUsd?: number,
): boolean {
  if (!amountIn || !amountOut) return false
  const inVal = new Big(amountIn)
  const outVal = new Big(amountOut)
  if (!inVal.gt(0)) return false

  const useUsd = priceInUsd !== undefined && priceOutUsd !== undefined && priceInUsd > 0 && priceOutUsd > 0

  if (useUsd) {
    const usdIn = inVal.times(priceInUsd)
    const usdOut = outVal.times(priceOutUsd)
    if (!usdIn.gt(0)) return false
    return usdOut.lt(usdIn.times(MIN_OUTPUT_FRACTION))
  }

  return outVal.lt(inVal.times(MIN_OUTPUT_FRACTION))
}

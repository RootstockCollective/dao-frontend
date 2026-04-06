import type { SwapInputToken } from '@/components/SwapInput'
import Big from '@/lib/big'
import { USDRIF, USDT0 } from '@/lib/constants'

export type LowLiquidityWarningToken = Pick<SwapInputToken, 'symbol' | 'price'>

/** Show warning when user loses more than 5%: output below 95% of input. */
const MIN_OUTPUT_FRACTION = 0.95

/** Tokens we treat as ~$1 nominal; safe to compare human amounts when USD prices are missing. */
const STABLE_NOMINAL_SWAP_SYMBOLS = new Set<string>([USDT0, USDRIF])

function isStableNominalSwapPair(tokenInSymbol?: string, tokenOutSymbol?: string): boolean {
  if (!tokenInSymbol || !tokenOutSymbol) return false
  return STABLE_NOMINAL_SWAP_SYMBOLS.has(tokenInSymbol) && STABLE_NOMINAL_SWAP_SYMBOLS.has(tokenOutSymbol)
}

/**
 * Exact copy for the low-liquidity warning message (product requirement).
 */
export const LOW_LIQUIDITY_WARNING_MESSAGE =
  'Warning: there is not enough liquidity to swap the full amount. Please double check you are happy with the amounts shown prior to swapping.'

/**
 * Returns true when effective output value is more than ~5% below input value.
 *
 * When **both** tokens have a `price` defined and &gt; 0, compares **USD notionals**
 * (same idea as the fiat line under each input). Use that for cross-asset pairs
 * (e.g. RIF → USDRIF, RIF → WrBTC when WrBTC uses the same USD reference as RBTC).
 *
 * Otherwise, if both symbols form a **USDT0 ↔ USDRIF** pair, compares human amounts (legacy).
 * For any other pair without two positive USD prices, returns **false** — raw amounts are not
 * comparable (e.g. 1000 RIF vs 35 USDRIF would falsely look like &gt;5% loss).
 *
 * @param amountIn - Human-readable input amount
 * @param amountOut - Human-readable quoted output amount
 * @param tokenIn - Token-in `symbol` and optional USD `price` (e.g. `SwapInputToken` fields)
 * @param tokenOut - Token-out `symbol` and optional USD `price`
 */
export function shouldShowLowLiquidityWarning(
  amountIn: string,
  amountOut: string,
  tokenIn: LowLiquidityWarningToken,
  tokenOut: LowLiquidityWarningToken,
): boolean {
  if (!amountIn || !amountOut) return false
  const inVal = new Big(amountIn)
  const outVal = new Big(amountOut)
  if (!inVal.gt(0)) return false

  const priceInUsd = tokenIn.price
  const priceOutUsd = tokenOut.price
  const useUsd = priceInUsd !== undefined && priceOutUsd !== undefined && priceInUsd > 0 && priceOutUsd > 0

  if (useUsd) {
    const usdIn = inVal.times(priceInUsd)
    const usdOut = outVal.times(priceOutUsd)
    if (!usdIn.gt(0)) return false
    return usdOut.lt(usdIn.times(MIN_OUTPUT_FRACTION))
  }

  if (isStableNominalSwapPair(tokenIn.symbol, tokenOut.symbol)) {
    return outVal.lt(inVal.times(MIN_OUTPUT_FRACTION))
  }

  return false
}

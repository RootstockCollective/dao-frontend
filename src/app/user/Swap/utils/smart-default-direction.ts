import Big from '@/lib/big'
import { USDRIF, USDT0 } from '@/lib/constants'
import type { SwapTokenSymbol } from '@/shared/stores/swap'

interface SwapDirection {
  tokenIn: SwapTokenSymbol
  tokenOut: SwapTokenSymbol
}

/**
 * Determines the smart default swap direction based on the user's token balances.
 *
 * When the user has no USDT0 but holds USDRIF, it makes more sense to default
 * the "From" field to USDRIF so the user can swap immediately without switching.
 *
 * @param usdt0Balance - User's USDT0 balance as a string (e.g. "0", "100.5")
 * @param usdrifBalance - User's USDRIF balance as a string (e.g. "0", "50.25")
 * @returns The recommended token direction for the swap modal
 */
export const getSmartDefaultSwapDirection = (usdt0Balance: string, usdrifBalance: string): SwapDirection => {
  const hasNoUsdt0 = Big(usdt0Balance).lte(0)
  const hasUsdrif = Big(usdrifBalance).gt(0)

  if (hasNoUsdt0 && hasUsdrif) {
    return { tokenIn: USDRIF, tokenOut: USDT0 }
  }

  return { tokenIn: USDT0, tokenOut: USDRIF }
}

import Big from '@/lib/big'
import { RIF, USDRIF, USDT0 } from '@/lib/constants'
import type { SwapTokenSymbol } from '@/shared/stores/swap'

interface SwapDirection {
  tokenIn: SwapTokenSymbol
  tokenOut: SwapTokenSymbol
}

/**
 * Determines the smart default swap direction based on the user's token balances.
 *
 * Priority: fund with USDT0 when available; else spend USDRIF; else spend RIF toward USDRIF
 * (multihop via USDT0). Matches STORY-006 triple-token flow without extra UI controls.
 *
 * @param usdt0Balance - User's USDT0 balance as a string (e.g. "0", "100.5")
 * @param usdrifBalance - User's USDRIF balance as a string (e.g. "0", "50.25")
 * @param rifBalance - User's RIF balance as a string (e.g. "0", "10")
 * @returns The recommended token direction for the swap modal
 */
export const getSmartDefaultSwapDirection = (
  usdt0Balance: string,
  usdrifBalance: string,
  rifBalance: string,
): SwapDirection => {
  const hasUsdt0 = Big(usdt0Balance).gt(0)
  const hasUsdrif = Big(usdrifBalance).gt(0)
  const hasRif = Big(rifBalance).gt(0)

  if (hasUsdt0) {
    return { tokenIn: USDT0, tokenOut: USDRIF }
  }
  if (hasUsdrif) {
    return { tokenIn: USDRIF, tokenOut: USDT0 }
  }
  if (hasRif) {
    return { tokenIn: RIF, tokenOut: USDRIF }
  }

  return { tokenIn: USDT0, tokenOut: USDRIF }
}

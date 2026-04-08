import Big from '@/lib/big'
import { RIF, USDRIF, USDT0, WRBTC } from '@/lib/constants'
import type { SwapTokenSymbol } from '@/shared/stores/swap'

interface SwapDirection {
  tokenIn: SwapTokenSymbol
  tokenOut: SwapTokenSymbol
}

/**
 * Determines the smart default swap direction based on the user's token balances.
 *
 * Priority: USDT0 → USDRIF → RIF → WrBTC (ERC-20 only; native rBTC is separate). When WrBTC is the
 * funded side, default target is USDRIF (same spirit as RIF → USDRIF). Call once on modal open.
 *
 * @param usdt0Balance - User's USDT0 balance as a string (e.g. "0", "100.5")
 * @param usdrifBalance - User's USDRIF balance as a string (e.g. "0", "50.25")
 * @param rifBalance - User's RIF balance as a string (e.g. "0", "10")
 * @param wrbtcBalance - WrBTC (ERC-20) balance as a decimal string (e.g. from `formatEther`)
 * @returns The recommended token direction for the swap modal
 */
export const getSmartDefaultSwapDirection = (
  usdt0Balance: string,
  usdrifBalance: string,
  rifBalance: string,
  wrbtcBalance: string,
): SwapDirection => {
  const hasUsdt0 = Big(usdt0Balance).gt(0)
  const hasUsdrif = Big(usdrifBalance).gt(0)
  const hasRif = Big(rifBalance).gt(0)
  const hasWrbtc = Big(wrbtcBalance).gt(0)

  if (hasUsdt0) {
    return { tokenIn: USDT0, tokenOut: USDRIF }
  }
  if (hasUsdrif) {
    return { tokenIn: USDRIF, tokenOut: USDT0 }
  }
  if (hasRif) {
    return { tokenIn: RIF, tokenOut: USDRIF }
  }
  if (hasWrbtc) {
    return { tokenIn: WRBTC, tokenOut: USDRIF }
  }

  return { tokenIn: USDT0, tokenOut: USDRIF }
}

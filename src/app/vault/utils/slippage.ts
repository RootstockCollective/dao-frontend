import Big from '@/lib/big'
import { VAULT_DEFAULT_SLIPPAGE_PERCENTAGE } from '@/lib/constants'

/**
 * Default slippage percentage - configurable via NEXT_PUBLIC_VAULT_DEFAULT_SLIPPAGE_PERCENTAGE
 */
export const DEFAULT_SLIPPAGE_PERCENTAGE = VAULT_DEFAULT_SLIPPAGE_PERCENTAGE

/**
 * Calculate minimum shares out for deposit with slippage protection
 * @param expectedShares - Expected shares from previewDeposit (already in wei)
 * @param slippagePercentage - Slippage percentage (default 0.5%)
 * @returns Minimum shares out as bigint
 */
export function calculateMinSharesOut(
  expectedShares: bigint,
  slippagePercentage: number = DEFAULT_SLIPPAGE_PERCENTAGE,
): bigint {
  const expectedSharesBig = Big(expectedShares.toString())
  const slippageFactor = Big(100 - slippagePercentage).div(100)
  const minSharesOut = expectedSharesBig.mul(slippageFactor)

  // Round down for minimum shares (conservative for user)
  return BigInt(minSharesOut.toFixed(0, Big.roundDown))
}

/**
 * Calculate maximum shares in for withdraw with slippage protection
 * @param expectedShares - Expected shares from previewWithdraw (already in wei)
 * @param slippagePercentage - Slippage percentage (default 0.5%)
 * @returns Maximum shares in as bigint
 */
export function calculateMaxSharesIn(
  expectedShares: bigint,
  slippagePercentage: number = DEFAULT_SLIPPAGE_PERCENTAGE,
): bigint {
  const expectedSharesBig = Big(expectedShares.toString())
  const slippageFactor = Big(100 + slippagePercentage).div(100)
  const maxSharesIn = expectedSharesBig.mul(slippageFactor)

  // Round up for maximum shares (conservative for user)
  return BigInt(maxSharesIn.toFixed(0, Big.roundUp))
}

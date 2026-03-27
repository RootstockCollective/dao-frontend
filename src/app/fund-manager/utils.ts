import type { EpochSnapshot } from '@/lib/apy'
import { computeIndicativeApy as computeIndicativeApyRaw } from '@/lib/apy'

/**
 * Computes an indicative APY from two consecutive epoch snapshots.
 * Wraps the shared `computeIndicativeApy` with string formatting for Fund Manager display.
 *
 * @returns Formatted APY string (e.g. "5.25%", "-2.50%") or "—" when not computable.
 */
export function computeIndicativeApy(
  currentEpoch: EpochSnapshot | null,
  prevEpoch: EpochSnapshot | null,
): string {
  const apy = computeIndicativeApyRaw(currentEpoch, prevEpoch)
  if (apy === null) return '—'
  return `${(apy * 100).toFixed(2)}%`
}

/**
 * Solves for `reportedOffchainAssets` that yields a given `totalAssets` (NAV)
 * per the vault's accounting identity:
 *
 *   totalAssets = (onchainBalance + reportedOffchainAssets) - liabilities
 *   liabilities = outstandingRedeemAssets + totalPendingDepositAssets + bufferDebt
 *
 * @see RBTCAsyncVault.totalAssets() in rbtc-vault-sc
 */
export function reportedOffchainForTargetTotalAssets(
  targetTotalAssets: bigint,
  onchainBalance: bigint,
  outstandingRedeemAssets: bigint,
  totalPendingDepositAssets: bigint,
  bufferDebt: bigint,
): bigint {
  const liabilities = outstandingRedeemAssets + totalPendingDepositAssets + bufferDebt
  const gross = targetTotalAssets + liabilities
  return gross - onchainBalance
}

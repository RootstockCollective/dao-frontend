import Big from 'big.js'

import { growthFactorToApy } from '@/lib/apy'

interface EpochSnapshot {
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
 * @returns Formatted APY string (e.g. "5.25%", "-2.50%") or "—" when not computable.
 */
export function computeIndicativeApy(
  currentEpoch: EpochSnapshot | null,
  prevEpoch: EpochSnapshot | null,
): string {
  if (!currentEpoch || !prevEpoch) return '—'
  if (currentEpoch.supplyAtClose === 0n || prevEpoch.supplyAtClose === 0n) return '—'

  const elapsed = currentEpoch.closedAt - prevEpoch.closedAt
  if (elapsed <= 0n) return '—'

  const sharePriceNow = Big(currentEpoch.assetsAtClose.toString()).div(currentEpoch.supplyAtClose.toString())
  const sharePricePrev = Big(prevEpoch.assetsAtClose.toString()).div(prevEpoch.supplyAtClose.toString())

  if (sharePricePrev.eq(0)) return '—'

  const priceRatio = Number(sharePriceNow.div(sharePricePrev).toString())
  const apy = growthFactorToApy(priceRatio, Number(elapsed))

  if (!Number.isFinite(apy)) return '—'
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

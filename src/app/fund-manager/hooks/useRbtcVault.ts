import { useMemo } from 'react'

import { rbtcVault } from '@/lib/contracts'
import { useReadRbtcVault, useReadRbtcVaultForMultipleArgs } from '@/shared/hooks/contracts/btc-vault'

function parseEpochSnapshot(result: unknown) {
  const tuple = result as readonly [bigint, bigint, bigint, bigint] | undefined
  if (!tuple) return null
  const [closedAt, assetsAtClose, supplyAtClose] = tuple
  if (closedAt === 0n) return null
  return { closedAt, assetsAtClose, supplyAtClose }
}

/**
 * Hook for reading on-chain data from the RBTCAsyncVault contract.
 */
export function useRbtcVault() {
  const {
    data: assetAddress,
    isLoading: isAssetLoading,
    error: assetError,
  } = useReadRbtcVault({ functionName: 'asset' })
  const {
    data: currentEpoch,
    isLoading: isCurrentEpochLoading,
    error: currentEpochError,
  } = useReadRbtcVault({ functionName: 'currentEpoch' })
  const {
    data: reportedOffchainAssets,
    isLoading: isReportedOffchainAssetsLoading,
    error: reportedOffchainAssetsError,
  } = useReadRbtcVault({ functionName: 'reportedOffchainAssets' })
  const {
    data: freeOnchainLiquidity,
    isLoading: isFreeOnchainLiquidityLoading,
    error: freeOnchainLiquidityError,
  } = useReadRbtcVault({ functionName: 'freeOnchainLiquidity' })

  const lastEpochId = currentEpoch && currentEpoch >= 2n ? currentEpoch - 1n : undefined // most recent closed epoch
  const prevEpochId = currentEpoch && currentEpoch >= 3n ? currentEpoch - 2n : undefined // second most recent closed epoch

  const {
    data: vaultBalance,
    isLoading: isVaultBalanceLoading,
    error: vaultBalanceError,
  } = useReadRbtcVault({ functionName: 'balanceOf', args: [rbtcVault.address] }, { enabled: !!assetAddress })

  const epochArgs = useMemo((): [bigint][] => {
    if (lastEpochId && prevEpochId) {
      return [[lastEpochId], [prevEpochId]]
    }
    if (lastEpochId) {
      return [[lastEpochId]]
    }
    return []
  }, [lastEpochId, prevEpochId])

  const {
    data: epochSnapshots,
    isLoading: isSnapshotLoading,
    error: snapshotError,
  } = useReadRbtcVaultForMultipleArgs(
    { functionName: 'epochSnapshot', args: epochArgs },
    { enabled: epochArgs.length > 0 },
  )

  const isLoading =
    isAssetLoading ||
    isCurrentEpochLoading ||
    isReportedOffchainAssetsLoading ||
    isFreeOnchainLiquidityLoading ||
    isVaultBalanceLoading ||
    (epochArgs.length > 0 && isSnapshotLoading)

  const error =
    assetError ??
    currentEpochError ??
    reportedOffchainAssetsError ??
    freeOnchainLiquidityError ??
    vaultBalanceError ??
    snapshotError ??
    null

  return useMemo(() => {
    const lastClosedEpoch = lastEpochId ? parseEpochSnapshot(epochSnapshots?.[0]) : null
    const previousClosedEpoch = prevEpochId ? parseEpochSnapshot(epochSnapshots?.[1]) : null

    return {
      vaultBalance: vaultBalance ?? 0n,
      reportedOffchainAssets: reportedOffchainAssets ?? 0n,
      freeOnchainLiquidity: freeOnchainLiquidity ?? 0n,
      lastClosedEpoch,
      previousClosedEpoch,
      isLoading,
      error,
    }
  }, [
    vaultBalance,
    reportedOffchainAssets,
    freeOnchainLiquidity,
    lastEpochId,
    prevEpochId,
    epochSnapshots,
    isLoading,
    error,
  ])
}

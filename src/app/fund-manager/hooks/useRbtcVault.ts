import { useMemo } from 'react'

import { useReadRbtcVaultBatch, useReadRbtcVaultForMultipleArgs } from '@/shared/hooks/contracts/btc-vault'

function parseEpochSnapshot(tuple: readonly [bigint, bigint, bigint, bigint] | undefined) {
  if (!tuple) return null
  const [closedAt, assetsAtClose, supplyAtClose] = tuple
  if (closedAt === 0n) return null
  return { closedAt, assetsAtClose, supplyAtClose }
}

const vaultConfigs = [
  { functionName: 'totalAssets' as const },
  { functionName: 'currentEpoch' as const },
  { functionName: 'reportedOffchainAssets' as const },
  { functionName: 'freeOnchainLiquidity' as const },
] as const

/**
 * Hook for reading on-chain data from the RBTCAsyncVault contract.
 */
export const useRbtcVault = () => {
  const {
    data: batchData,
    isLoading: isBatchLoading,
    error: batchError,
  } = useReadRbtcVaultBatch(vaultConfigs)

  const [totalAssets = 0n, currentEpoch, reportedOffchainAssets = 0n, freeOnchainLiquidity = 0n] = batchData

  const lastEpochId = currentEpoch && currentEpoch >= 2n ? currentEpoch - 1n : undefined
  const prevEpochId = currentEpoch && currentEpoch >= 3n ? currentEpoch - 2n : undefined

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

  return useMemo(() => {
    const lastClosedEpoch = lastEpochId ? parseEpochSnapshot(epochSnapshots?.[0]) : null
    const previousClosedEpoch = prevEpochId ? parseEpochSnapshot(epochSnapshots?.[1]) : null
    const isLoading = isBatchLoading || (epochArgs.length > 0 && isSnapshotLoading)
    const error = batchError ?? snapshotError ?? null

    return {
      totalAssets,
      reportedOffchainAssets,
      freeOnchainLiquidity,
      lastClosedEpoch,
      previousClosedEpoch,
      isLoading,
      error,
    }
  }, [
    totalAssets,
    reportedOffchainAssets,
    freeOnchainLiquidity,
    lastEpochId,
    prevEpochId,
    epochSnapshots,
    isBatchLoading,
    isSnapshotLoading,
    batchError,
    snapshotError,
    epochArgs.length,
  ])
}

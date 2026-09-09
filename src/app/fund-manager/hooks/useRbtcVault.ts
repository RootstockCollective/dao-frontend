import { useCallback, useMemo } from 'react'
import { type Address, erc20Abi } from 'viem'
import { useReadContract } from 'wagmi'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { rbtcVault } from '@/lib/contracts'
import { useReadRbtcVaultBatch, useReadRbtcVaultForMultipleArgs } from '@/shared/hooks/contracts/btc-vault'

function parseEpochSnapshot(tuple: readonly [bigint, bigint, bigint, bigint] | undefined) {
  if (!tuple) return null
  const [closedAt, assetsAtClose, supplyAtClose] = tuple
  if (closedAt === 0n) return null
  return { closedAt, assetsAtClose, supplyAtClose }
}

const VAULT_CONFIGS = [
  { functionName: 'asset' },
  { functionName: 'currentEpoch' },
  { functionName: 'reportedOffchainAssets' },
  { functionName: 'freeOnchainLiquidity' },
  { functionName: 'totalAssets' },
  { functionName: 'totalPendingDepositAssets' },
  { functionName: 'totalRedeemRequiredAssets' },
  { functionName: 'totalRedeemPaidAssets' },
] as const

/**
 * Hook for reading on-chain data from the RBTCAsyncVault contract.
 */
export const useRbtcVault = () => {
  const {
    data: batchData,
    isLoading: isBatchLoading,
    error: batchError,
    refetch: refetchBatch,
  } = useReadRbtcVaultBatch(VAULT_CONFIGS)

  const [
    assetAddress,
    currentEpoch,
    reportedOffchainAssetsRaw,
    freeOnchainLiquidity = 0n,
    totalAssets = 0n,
    totalPendingDepositAssets = 0n,
    totalRedeemRequiredAssets = 0n,
    totalRedeemPaidAssets = 0n,
  ] = batchData

  /** Successful read only; `null` while loading, on batch error, or if this call failed (per-call failures do not set `vaultBatchError`). */
  const reportedOffchainAssets: bigint | null =
    !isBatchLoading && !batchError && reportedOffchainAssetsRaw !== undefined
      ? reportedOffchainAssetsRaw
      : null

  const {
    data: vaultAssetBalance = 0n,
    isLoading: isBalanceLoading,
    error: balanceError,
    refetch: refetchVaultTokenBalance,
  } = useReadContract({
    abi: erc20Abi,
    address: assetAddress as Address,
    functionName: 'balanceOf',
    args: [rbtcVault.address],
    query: {
      enabled: !!assetAddress,
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

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
    refetch: refetchEpochSnapshots,
  } = useReadRbtcVaultForMultipleArgs(
    { functionName: 'epochSnapshot', args: epochArgs },
    { enabled: epochArgs.length > 0 },
  )

  const refetchVault = useCallback(async () => {
    await Promise.all([refetchBatch(), refetchVaultTokenBalance(), refetchEpochSnapshots()])
  }, [refetchBatch, refetchEpochSnapshots, refetchVaultTokenBalance])

  return useMemo(() => {
    const lastClosedEpoch = lastEpochId ? parseEpochSnapshot(epochSnapshots?.[0]) : null
    const previousClosedEpoch = prevEpochId ? parseEpochSnapshot(epochSnapshots?.[1]) : null
    const isLoading = isBatchLoading || isBalanceLoading || (epochArgs.length > 0 && isSnapshotLoading)
    const error = batchError || balanceError || snapshotError

    return {
      vaultAssetBalance,
      reportedOffchainAssets,
      freeOnchainLiquidity,
      lastClosedEpoch,
      previousClosedEpoch,
      totalAssets,
      totalPendingDepositAssets,
      totalRedeemRequiredAssets,
      totalRedeemPaidAssets,
      /** True while the batched vault multicall is in flight. */
      isBatchLoading,
      /** Set when the whole batched `useReadContracts` query fails; individual call failures leave this null. */
      vaultBatchError: batchError ?? null,
      isLoading,
      error,
      refetchVault,
    }
  }, [
    vaultAssetBalance,
    reportedOffchainAssets,
    freeOnchainLiquidity,
    totalAssets,
    totalPendingDepositAssets,
    totalRedeemRequiredAssets,
    totalRedeemPaidAssets,
    lastEpochId,
    prevEpochId,
    epochSnapshots,
    isBatchLoading,
    isBalanceLoading,
    isSnapshotLoading,
    batchError,
    balanceError,
    snapshotError,
    epochArgs,
    refetchVault,
  ])
}

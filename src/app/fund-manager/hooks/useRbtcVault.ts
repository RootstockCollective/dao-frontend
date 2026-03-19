import { useMemo } from 'react'
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
  } = useReadRbtcVaultBatch(VAULT_CONFIGS)

  const [
    assetAddress,
    currentEpoch,
    reportedOffchainAssets = 0n,
    freeOnchainLiquidity = 0n,
    totalAssets = 0n,
    totalPendingDepositAssets = 0n,
    totalRedeemRequiredAssets = 0n,
    totalRedeemPaidAssets = 0n,
  ] = batchData

  const {
    data: vaultAssetBalance = 0n,
    isLoading: isBalanceLoading,
    error: balanceError,
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
  } = useReadRbtcVaultForMultipleArgs(
    { functionName: 'epochSnapshot', args: epochArgs },
    { enabled: epochArgs.length > 0 },
  )

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
      isLoading,
      error,
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
  ])
}

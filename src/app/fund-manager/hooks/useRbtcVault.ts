import { useMemo } from 'react'
import { type Abi, erc20Abi } from 'viem'
import { useReadContracts } from 'wagmi'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { rbtcAsyncVault } from '@/lib/contracts'

// SAFETY: ABI omits `inputs` on parameterless entries,
// which is valid JSON-ABI but violates abitype's strict shape.
const vaultAbi = rbtcAsyncVault.abi as unknown as Abi

const primaryContracts = [
  { address: rbtcAsyncVault.address, abi: vaultAbi, functionName: 'asset' },
  { address: rbtcAsyncVault.address, abi: vaultAbi, functionName: 'currentEpoch' },
  { address: rbtcAsyncVault.address, abi: vaultAbi, functionName: 'reportedOffchainAssets' },
  { address: rbtcAsyncVault.address, abi: vaultAbi, functionName: 'freeOnchainLiquidity' },
] as const

function parseEpochSnapshot(result: unknown) {
  const tuple = result as readonly [bigint, bigint, bigint, bigint] | undefined
  if (!tuple) return null
  const [closedAt, assetsAtClose, supplyAtClose] = tuple
  if (closedAt === 0n) return null
  return { closedAt, assetsAtClose, supplyAtClose }
}

/**
 * Reads on-chain data from the RBTCAsyncVault contract.
 *
 * Two-phase fetch:
 *  1. Primary: asset address, currentEpoch, reportedOffchainAssets, freeOnchainLiquidity.
 *  2. Dependent: asset balanceOf(vault), epochSnapshot(last), epochSnapshot(previous).
 */
export function useRbtcVault() {
  const {
    data: primaryData,
    isLoading: isPrimaryLoading,
    error: primaryError,
  } = useReadContracts({
    contracts: primaryContracts,
    query: { refetchInterval: AVERAGE_BLOCKTIME },
  })

  const assetAddress = primaryData?.[0]?.result as `0x${string}` | undefined
  const currentEpoch = primaryData?.[1]?.result as bigint | undefined

  const lastEpochId = currentEpoch && currentEpoch >= 2n ? currentEpoch - 1n : undefined // most recent closed epoch
  const prevEpochId = currentEpoch && currentEpoch >= 3n ? currentEpoch - 2n : undefined // second most recent closed epoch

  const dependentContracts = useMemo(() => {
    if (!assetAddress) return []
    return [
      {
        address: assetAddress,
        abi: erc20Abi,
        functionName: 'balanceOf' as const,
        args: [rbtcAsyncVault.address],
      },
      ...(lastEpochId
        ? [
            {
              address: rbtcAsyncVault.address,
              abi: vaultAbi,
              functionName: 'epochSnapshot',
              args: [lastEpochId],
            },
          ]
        : []),
      ...(prevEpochId
        ? [
            {
              address: rbtcAsyncVault.address,
              abi: vaultAbi,
              functionName: 'epochSnapshot',
              args: [prevEpochId],
            },
          ]
        : []),
    ]
  }, [assetAddress, lastEpochId, prevEpochId])

  const {
    data: depData,
    isLoading: isDepLoading,
    error: depError,
  } = useReadContracts({
    contracts: dependentContracts,
    query: {
      enabled: dependentContracts.length > 0,
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  return useMemo(() => {
    const reportedOffchainAssets = (primaryData?.[2]?.result as bigint | undefined) ?? 0n
    const freeOnchainLiquidity = (primaryData?.[3]?.result as bigint | undefined) ?? 0n

    const vaultBalance = (depData?.[0]?.result as bigint | undefined) ?? 0n

    let snapshotIdx = 1
    const lastClosedEpoch = lastEpochId ? parseEpochSnapshot(depData?.[snapshotIdx++]?.result) : null
    const previousClosedEpoch = prevEpochId ? parseEpochSnapshot(depData?.[snapshotIdx]?.result) : null

    const error = primaryError ?? depError ?? null

    return {
      vaultBalance,
      reportedOffchainAssets,
      freeOnchainLiquidity,
      lastClosedEpoch,
      previousClosedEpoch,
      isLoading: isPrimaryLoading || (dependentContracts.length > 0 && isDepLoading),
      error,
    }
  }, [
    primaryData,
    depData,
    lastEpochId,
    prevEpochId,
    primaryError,
    depError,
    isPrimaryLoading,
    isDepLoading,
    dependentContracts.length,
  ])
}

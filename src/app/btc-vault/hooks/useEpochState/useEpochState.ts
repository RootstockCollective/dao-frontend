'use client'

import { useCallback, useMemo } from 'react'
import { useReadContract, useReadContracts } from 'wagmi'

import { rbtcVault } from '@/lib/contracts'

import { EPOCH_DURATION_SEC } from '../../services/constants'
import type { EpochState, EpochStatus } from '../../services/types'
import { toEpochDisplay } from '../../services/ui/mappers'

/** epochSnapshot returns [closedAt, assetsAtClose, supplyAtClose, syntheticAddedAssets] */
type EpochSnapshotResult = readonly [bigint, bigint, bigint, bigint]

function isSuccess<T>(r: { status: string; result?: T }): r is { status: 'success'; result: T } {
  return r.status === 'success' && r.result !== undefined
}

const BATCH_CONTRACTS = [
  { ...rbtcVault, functionName: 'epochSnapshot' as const, args: [0n] as const },
  { ...rbtcVault, functionName: 'epochRedeemClaimable' as const, args: [0n] as const },
  { ...rbtcVault, functionName: 'openEpochPendingDepositAssets' as const },
  { ...rbtcVault, functionName: 'epochTotalRedeemShares' as const, args: [0n] as const },
] as const

/**
 * Reads the current epoch state from the BTC vault contract and returns display-ready epoch data.
 * Uses useReadContract for currentEpoch, then useReadContracts for snapshot, claimable flag,
 * pending deposits, and redemption shares; optionally reads previous epoch snapshot for startTime.
 * Derives status as open | settling | claimable and computes navPerShare for settled epochs.
 *
 * @returns { data: EpochDisplay | undefined, isLoading: boolean, error: Error | undefined, refetch: () => void }
 */
export function useEpochState() {
  const {
    data: currentEpochResult,
    isLoading: isLoadingCurrent,
    error: errorCurrent,
    refetch: refetchCurrent,
  } = useReadContract({
    ...rbtcVault,
    functionName: 'currentEpoch',
  })

  const epochId = currentEpochResult !== undefined ? currentEpochResult : undefined

  const contracts = useMemo(() => {
    if (epochId === undefined) return BATCH_CONTRACTS
    return [
      { ...rbtcVault, functionName: 'epochSnapshot' as const, args: [epochId] as const },
      { ...rbtcVault, functionName: 'epochRedeemClaimable' as const, args: [epochId] as const },
      { ...rbtcVault, functionName: 'openEpochPendingDepositAssets' as const },
      { ...rbtcVault, functionName: 'epochTotalRedeemShares' as const, args: [epochId] as const },
    ] as const
  }, [epochId])

  const {
    data: batchData,
    isLoading: isLoadingBatch,
    error: errorBatch,
    refetch: refetchBatch,
  } = useReadContracts({
    contracts,
    query: { enabled: epochId !== undefined },
  })

  const {
    data: prevSnapshotData,
    isLoading: isLoadingPrev,
    refetch: refetchPrev,
  } = useReadContract({
    ...rbtcVault,
    functionName: 'epochSnapshot',
    args: epochId !== undefined && epochId > 0n ? [epochId - 1n] : undefined,
    query: { enabled: epochId !== undefined && epochId > 0n },
  })

  const rawState = useMemo((): EpochState | null => {
    if (epochId === undefined || !batchData || batchData.length < 4) return null

    const snapshotResult = batchData[0]
    const claimableResult = batchData[1]
    const pendingAssetsResult = batchData[2]
    const totalRedeemResult = batchData[3]

    if (
      !isSuccess(snapshotResult) ||
      !isSuccess(claimableResult) ||
      !isSuccess(pendingAssetsResult) ||
      !isSuccess(totalRedeemResult)
    ) {
      return null
    }

    const snapshot = snapshotResult.result as EpochSnapshotResult
    const [closedAt, assetsAtClose, supplyAtClose] = snapshot
    const claimable = claimableResult.result as boolean
    const totalDepositAssets = pendingAssetsResult.result as bigint
    const totalRedemptionShares = totalRedeemResult.result as bigint

    const startTime =
      epochId > 0n && prevSnapshotData !== undefined
        ? Number((prevSnapshotData as EpochSnapshotResult)[0])
        : 0
    const endTime = startTime + EPOCH_DURATION_SEC

    let status: EpochStatus
    if (closedAt === 0n) {
      status = 'open'
    } else if (claimable) {
      status = 'claimable'
    } else {
      status = 'settling'
    }

    const navPerShare: bigint | null =
      closedAt > 0n ? (assetsAtClose * 10n ** 18n) / (supplyAtClose || 1n) : null

    const settledAt = closedAt > 0n ? Number(closedAt) : null

    return {
      epochId: String(epochId),
      status,
      startTime,
      endTime,
      settledAt,
      navPerShare,
      totalDepositAssets,
      totalRedemptionShares,
    }
  }, [epochId, batchData, prevSnapshotData])

  const data = rawState ? toEpochDisplay(rawState) : undefined
  const isLoading =
    isLoadingCurrent || isLoadingBatch || (epochId !== undefined && epochId > 0n && isLoadingPrev)
  const error = errorCurrent ?? errorBatch

  const refetch = useCallback(() => {
    refetchCurrent()
    refetchBatch()
    refetchPrev()
  }, [refetchCurrent, refetchBatch, refetchPrev])

  return {
    data,
    isLoading,
    error: error ?? undefined,
    refetch,
  }
}

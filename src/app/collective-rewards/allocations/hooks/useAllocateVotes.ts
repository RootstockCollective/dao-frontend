import posthog from 'posthog-js'
import { useContext, useEffect, useRef } from 'react'
import { Address, formatEther } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

import { useAwaitedTxReporting } from '@/app/collective-rewards/shared/hooks'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import { BackersManagerAbi } from '@/lib/abis/tok/BackersManagerAbi'
import { BackersManagerAddress } from '@/lib/contracts'

import { Allocations, AllocationsContext } from '../context'
import { getVoteAllocations } from '../context/utils'

interface AllocationChange {
  builder_address: Address
  previous_amount_str: string
  previous_amount_decimal: number
  new_amount_str: string
  new_amount_decimal: number
  delta_decimal: number
  change_type: 'added' | 'increased' | 'decreased' | 'removed'
}

interface AllocationsSnapshot {
  summary: {
    token: 'stRIF'
    builders_count: number
    total_allocated_str: string
    total_allocated_decimal: number
    change_summary: { added: number; increased: number; decreased: number; removed: number }
    changes: AllocationChange[]
  }
  changes: AllocationChange[]
}

const computeAllocationsSnapshot = (
  initialAllocations: Allocations,
  currentAllocations: Allocations,
): AllocationsSnapshot | null => {
  const initial = initialAllocations ?? {}
  const current = currentAllocations ?? {}
  const allBuilderAddresses = new Set<Address>([
    ...(Object.keys(initial) as Address[]),
    ...(Object.keys(current) as Address[]),
  ])

  const changes: AllocationChange[] = []
  allBuilderAddresses.forEach(builderAddress => {
    const prev = initial[builderAddress] ?? 0n
    const next = current[builderAddress] ?? 0n
    if (prev === next) return

    const previousStr = formatEther(prev)
    const nextStr = formatEther(next)
    const previousDecimal = Number(previousStr) || 0
    const nextDecimal = Number(nextStr) || 0

    changes.push({
      builder_address: builderAddress,
      previous_amount_str: previousStr,
      previous_amount_decimal: previousDecimal,
      new_amount_str: nextStr,
      new_amount_decimal: nextDecimal,
      delta_decimal: nextDecimal - previousDecimal,
      change_type: prev === 0n ? 'added' : next === 0n ? 'removed' : next > prev ? 'increased' : 'decreased',
    })
  })

  if (changes.length === 0) return null

  const totalAllocatedWei = Object.values(current).reduce<bigint>((sum, v) => sum + v, 0n)
  const totalAllocatedStr = formatEther(totalAllocatedWei)

  return {
    changes,
    summary: {
      token: 'stRIF',
      builders_count: changes.length,
      total_allocated_str: totalAllocatedStr,
      total_allocated_decimal: Number(totalAllocatedStr) || 0,
      change_summary: {
        added: changes.filter(c => c.change_type === 'added').length,
        increased: changes.filter(c => c.change_type === 'increased').length,
        decreased: changes.filter(c => c.change_type === 'decreased').length,
        removed: changes.filter(c => c.change_type === 'removed').length,
      },
      changes,
    },
  }
}

export const useAllocateVotes = () => {
  const { writeContractAsync, error: executionError, data: hash, isPending } = useWriteContract()

  const {
    initialState: { allocations: initialAllocations },
    state: { allocations, getBuilder, isValidState, refetchRawAllocations },
    actions: { setIsAllocationTxPending },
  } = useContext(AllocationsContext)

  const canSaveAllocation = isValidState()

  const { isLoading, isSuccess, data, error: receiptError } = useWaitForTransactionReceipt({ hash })

  const error = executionError ?? receiptError

  const pendingSnapshotRef = useRef<AllocationsSnapshot | null>(null)

  // Update context state when transaction state changes
  useEffect(() => {
    setIsAllocationTxPending(isPending || isLoading)
  }, [isPending, isLoading, setIsAllocationTxPending])

  // Trigger data refresh after successful transaction
  useEffect(() => {
    if (isSuccess) {
      refetchRawAllocations()
    }
  }, [isSuccess, refetchRawAllocations])

  // Emit confirmed event when the save mines on-chain
  useEffect(() => {
    if (!isSuccess || !pendingSnapshotRef.current) return
    const snap = pendingSnapshotRef.current
    posthog.capture('backing_allocations_confirmed', { ...snap.summary, tx_hash: hash })
    snap.changes.forEach(change => {
      posthog.capture('backing_allocation_changed', { ...change, token: 'stRIF', tx_hash: hash })
    })
    pendingSnapshotRef.current = null
  }, [isSuccess, hash])

  // Emit failed event on rejection or on-chain failure
  useEffect(() => {
    if (!error || !pendingSnapshotRef.current) return
    const snap = pendingSnapshotRef.current
    posthog.capture('backing_allocations_failed', {
      ...snap.summary,
      failure_reason: isUserRejectedTxError(error) ? 'user_rejected' : 'tx_failed',
      error_message: error.message,
      tx_hash: hash,
    })
    pendingSnapshotRef.current = null
  }, [error, hash])

  const saveAllocations = () => {
    const [gauges, allocs] = getVoteAllocations({
      initialAllocations,
      currentAllocations: allocations,
      getBuilder,
    })

    if (allocs.length === 0) {
      console.error('No allocations to save')
      return
    }

    const snapshot = computeAllocationsSnapshot(initialAllocations, allocations)
    if (snapshot) {
      pendingSnapshotRef.current = snapshot
      posthog.capture('backing_allocations_saved', snapshot.summary)
    }

    const isBatchAllocation = allocs.length > 1

    return writeContractAsync({
      abi: BackersManagerAbi,
      address: BackersManagerAddress,
      functionName: isBatchAllocation ? 'allocateBatch' : 'allocate',
      args: isBatchAllocation ? [gauges, allocs] : [gauges[0], allocs[0]],
    })
  }

  // TODO: validate what are we going to do with the notifications at the top
  // since when you press the button to save the allocations, the notifications at the top are shown
  // causing the scroll to jump
  useAwaitedTxReporting({
    hash,
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
    title: 'Saving allocations',
    errorContent: 'Error saving allocations',
  })

  return {
    canSaveAllocation,
    saveAllocations: () => canSaveAllocation && saveAllocations(),
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
  }
}

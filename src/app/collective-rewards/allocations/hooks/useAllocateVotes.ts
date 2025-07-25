import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useAwaitedTxReporting } from '@/app/collective-rewards/shared/hooks'
import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { useContext, useEffect } from 'react'
import { AllocationsContext } from '../context'
import { getVoteAllocations } from '../context/utils'

export const useAllocateVotes = () => {
  const { writeContractAsync, error: executionError, data: hash, isPending } = useWriteContract()

  const {
    initialState: { allocations: initialAllocations },
    state: { allocations, getBuilder, isValidState, resetVersion },
    actions: { refreshData },
  } = useContext(AllocationsContext)

  const canSaveAllocation = isValidState()

  const { isLoading, isSuccess, data, error: receiptError } = useWaitForTransactionReceipt({ hash })

  const error = executionError ?? receiptError

  // Trigger data refresh after successful transaction
  useEffect(() => {
    if (isSuccess) {
      refreshData()
    }
  }, [isSuccess, refreshData])

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

import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useAwaitedTxReporting } from '@/app/collective-rewards/shared/hooks'
import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { useContext } from 'react'
import { AllocationsContext } from '../context'
import { getVoteAllocations } from '../context/utils'

export const useAllocateVotes = () => {
  const { writeContractAsync, error: executionError, data: hash, isPending } = useWriteContract()

  const {
    initialState: { allocations: initialAllocations },
    state: { allocations, getBuilder, isValidState },
  } = useContext(AllocationsContext)

  const { isLoading, isSuccess, data, error: receiptError } = useWaitForTransactionReceipt({ hash })

  const error = executionError ?? receiptError

  const saveAllocations = () => {
    const [gauges, allocs] = getVoteAllocations({
      initialAllocations,
      currentAllocations: allocations,
      getBuilder,
    })

    const isBatchAllocation = allocs.length > 1

    return writeContractAsync({
      abi: BackersManagerAbi,
      address: BackersManagerAddress,
      functionName: isBatchAllocation ? 'allocateBatch' : 'allocate',
      args: isBatchAllocation ? [gauges, allocs] : [gauges[0], allocs[0]],
    })
  }

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
    isValidState,
    saveAllocations: () => saveAllocations(),
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
  }
}

import { useAwaitedTxReporting } from '@/app/collective-rewards/shared/hooks'
import { useBackingContext } from '@/app/shared/context/BackingContext'
import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useBuilderContext } from '../../user'

export const useAllocateVotes = () => {
  const { writeContractAsync, error: executionError, data: hash, isPending } = useWriteContract()

  const {
    backings,
    balance,
    totalBacking
  } = useBackingContext()

  const {
    getBuilderByAddress
  } = useBuilderContext()

  const {
    invalidateQueries
  } = useQueryClient()

  const canSaveAllocation = useMemo(() => {
    if (totalBacking.pending > balance.onchain) {
      return false
    }

    if (totalBacking.pending === totalBacking.onchain) {
      return Object.values(backings).some(({ onchain, pending }) => pending !== onchain) // Ensure at least one backing has changed
    }

    return true
  }, [balance, backings, totalBacking])

  const { isLoading, isSuccess, data, error: receiptError } = useWaitForTransactionReceipt({ hash })

  const error = executionError ?? receiptError

  // Trigger data refresh after successful transaction
  useEffect(() => {
    if (isSuccess) {
      invalidateQueries()
    }
  }, [isSuccess, invalidateQueries])

  const saveAllocations = () => {
    const { allocs, gauges } = Object.entries(backings)
      .reduce((acc, [address, { pending, onchain }]) => {
        if (onchain === pending) return acc

        const builder = getBuilderByAddress(address as Address)

        if (!builder?.gauge) return acc

        return {
          gauges: [...acc.gauges, builder.gauge],
          allocs: [...acc.allocs, pending],
        }
      }, {
        gauges: [] as Address[],
        allocs: [] as bigint[],
      })

    if (!allocs.length) {
      console.error('No allocations to save')
      return
    }

    const requiresBatch = allocs.length > 1

    return writeContractAsync({
      abi: BackersManagerAbi,
      address: BackersManagerAddress,
      functionName: requiresBatch ? 'allocateBatch' : 'allocate',
      args: requiresBatch ? [gauges, allocs] : [gauges[0], allocs[0]],
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

import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { useMemo } from 'react'

export const useClaimBackerRewards = (gauges: Address[], rewardToken?: Address) => {
  const { writeContractAsync, error: executionError, data: hash, isPending } = useWriteContract()

  const { isLoading, isSuccess, data, error: receiptError } = useWaitForTransactionReceipt({ hash })

  const error = useMemo(() => {
    if (executionError) {
      return {
        ...executionError,
        shortMessage: `Failed claim execution (${executionError.message})`,
      }
    }

    if (receiptError) {
      return {
        ...receiptError,
        shortMessage: `Failed to get claim execution receipt (${receiptError.message})`,
      }
    }
  }, [executionError, receiptError])

  const claimBackerReward = () => {
    return writeContractAsync({
      abi: BackersManagerAbi,
      address: BackersManagerAddress,
      functionName: 'claimBackerRewards',
      args: rewardToken ? [rewardToken, gauges] : [gauges],
    })
  }

  return {
    claimRewards: () => claimBackerReward(),
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
  }
}

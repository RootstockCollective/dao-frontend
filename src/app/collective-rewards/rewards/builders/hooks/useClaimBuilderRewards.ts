import { useAwaitedTxReporting } from '@/app/collective-rewards/shared/hooks'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useGetBuilderRewards } from '@/app/collective-rewards/rewards'

export const useClaimBuilderRewards = (gauge: Address, rewardToken: Address) => {
  const { writeContractAsync, error: executionError, data: hash, isPending } = useWriteContract()
  const {
    data: rewards,
    isLoading: rewardsLoading,
    error: rewardsError,
  } = useGetBuilderRewards(rewardToken, gauge)

  const { isLoading, isSuccess, data, error: receiptError } = useWaitForTransactionReceipt({ hash })

  const isClaimable = !rewardsLoading && rewards !== 0n

  const error = executionError ?? rewardsError ?? receiptError

  const claimBuilderReward = (rewardToken?: Address) => {
    return writeContractAsync({
      abi: GaugeAbi,
      address: gauge as Address,
      functionName: 'claimBuilderReward',
      args: rewardToken ? [rewardToken] : [],
    })
  }

  useAwaitedTxReporting({
    hash,
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
    title: 'Claiming builder rewards',
  })

  return {
    isClaimable,
    claimRewards: (rewardToken?: Address) => isClaimable && claimBuilderReward(rewardToken),
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
  }
}

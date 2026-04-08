import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

import { useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { useAwaitedTxReporting } from '@/app/collective-rewards/shared'
import { BackersManagerAbi } from '@/lib/abis/tok/BackersManagerAbi'
import { BackersManagerAddress } from '@/lib/contracts'

export const useClaimBackerRewards = (rewardToken?: Address) => {
  const { writeContractAsync, error: executionError, data: hash, isPending } = useWriteContract()
  const {
    gaugesWithEarns,
    isLoading: backerRewardsLoading,
    error: backerRewardsError,
  } = useBackerRewardsContext()

  const { isLoading, isSuccess, data, error: receiptError } = useWaitForTransactionReceipt({ hash })

  const isClaimable = !backerRewardsLoading && gaugesWithEarns(rewardToken).length > 0
  const gauges = gaugesWithEarns(rewardToken)

  const error = executionError || receiptError || backerRewardsError

  const claimBackerReward = () => {
    return writeContractAsync({
      abi: BackersManagerAbi,
      address: BackersManagerAddress,
      functionName: 'claimBackerRewards',
      args: rewardToken ? [rewardToken, gauges] : [gauges],
    })
  }

  useAwaitedTxReporting({
    hash,
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
    title: 'Claiming backer rewards',
    errorContent: 'Error claiming backer rewards',
  })

  return {
    isClaimable,
    claimRewards: () => isClaimable && claimBackerReward(),
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
  }
}

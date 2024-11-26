import { useAwaitedTxReporting } from '@/app/collective-rewards/shared/hooks'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useGetBuilderRewards } from '@/app/collective-rewards/rewards'

const useClaimBuilderReward = (gauge: Address, rewardToken?: Address) => {
  const { writeContractAsync, error: executionError, data: hash, isPending } = useWriteContract()

  const { isLoading, isSuccess, data, error: receiptError } = useWaitForTransactionReceipt({ hash })

  const error = executionError ?? receiptError

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
    claimRewards: (rewardToken?: Address) => claimBuilderReward(rewardToken),
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
  }
}

export const useClaimBuilderRewards = (gauge: Address, { rif, rbtc }: { rif: Address; rbtc: Address }) => {
  const { error: claimBuilderRewardError, ...rest } = useClaimBuilderReward(gauge)
  const { isClaimable: rifClaimable, error: claimRifError } = useClaimBuilderRewardsPerToken(gauge, rif)
  const { isClaimable: rbtcClaimable, error: claimRbtcError } = useClaimBuilderRewardsPerToken(gauge, rbtc)

  const isClaimable = rifClaimable && rbtcClaimable
  const error = claimBuilderRewardError ?? claimRifError ?? claimRbtcError

  return {
    ...rest,
    isClaimable,
    error,
  }
}

export const useClaimBuilderRewardsPerToken = (gauge: Address, rewardToken: Address) => {
  const { error: claimBuilderRewardError, ...rest } = useClaimBuilderReward(gauge, rewardToken)
  const { data: rewards, isLoading, error: getBuilderRewardsError } = useGetBuilderRewards(rewardToken, gauge)

  const isClaimable = !isLoading && rewards !== 0n
  const error = claimBuilderRewardError ?? getBuilderRewardsError

  return {
    ...rest,
    isClaimable,
    error,
  }
}

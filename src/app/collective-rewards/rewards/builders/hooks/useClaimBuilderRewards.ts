import { useAwaitedTxReporting } from '@/app/collective-rewards/shared/hooks'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useGetBuilderRewards } from '@/app/collective-rewards/rewards'
import { useBuilderContext } from '@/app/collective-rewards/user'

const useClaimBuilderReward = (builder: Address, gauge: Address, rewardToken?: Address) => {
  const { writeContractAsync, error: executionError, data: hash, isPending } = useWriteContract()
  const { getBuilderByAddress } = useBuilderContext()

  const claimingBuilder = getBuilderByAddress(builder)
  const isPaused = claimingBuilder?.stateFlags?.paused ?? false

  const { isLoading, isSuccess, data, error: receiptError } = useWaitForTransactionReceipt({ hash })

  const error = executionError ?? receiptError

  const claimBuilderReward = () => {
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
    errorContent: 'Error claiming builder rewards',
  })

  return {
    claimRewards: () => claimBuilderReward(),
    isPaused,
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
  }
}

export const useClaimBuilderRewards = (
  builder: Address,
  gauge: Address,
  { rif, rbtc }: { rif: Address; rbtc: Address },
) => {
  const { error: claimBuilderRewardError, ...rest } = useClaimBuilderReward(builder, gauge)
  const { isClaimable: rifClaimable, error: claimRifError } = useClaimBuilderRewardsPerToken(
    builder,
    gauge,
    rif,
  )
  const { isClaimable: rbtcClaimable, error: claimRbtcError } = useClaimBuilderRewardsPerToken(
    builder,
    gauge,
    rbtc,
  )

  const isClaimable = rifClaimable || rbtcClaimable
  const error = claimBuilderRewardError ?? claimRifError ?? claimRbtcError

  return {
    ...rest,
    isClaimable,
    error,
  }
}

export const useClaimBuilderRewardsPerToken = (builder: Address, gauge: Address, rewardToken: Address) => {
  const { error: claimBuilderRewardError, ...rest } = useClaimBuilderReward(builder, gauge, rewardToken)
  const { data: rewards, isLoading, error: getBuilderRewardsError } = useGetBuilderRewards(rewardToken, gauge)

  const isClaimable = !isLoading && rewards !== 0n
  const error = claimBuilderRewardError ?? getBuilderRewardsError

  return {
    ...rest,
    isClaimable,
    error,
  }
}

import { useAwaitedTxReporting } from '@/app/collective-rewards/shared/hooks'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { GaugeAbi } from '@/lib/abis/tok/GaugeAbi'
import { TOKENS } from '@/lib/tokens'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

const useClaimBuilderReward = (builder: Address, gauge: Address, rewardToken?: Address) => {
  const { writeContractAsync, error: executionError, data: hash, isPending } = useWriteContract()
  const { getBuilderByAddress } = useBuilderContext()

  const claimingBuilder = getBuilderByAddress(builder)
  const isPaused = claimingBuilder?.stateFlags?.kycPaused ?? false

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

export const useClaimBuilderRewards = (builder: Address, gauge: Address) => {
  const {
    rif: { address: rifAddress },
    rbtc: { address: rbtcAddress },
    usdrif: { address: usdrifAddress },
  } = TOKENS

  const { error: claimBuilderRewardError, ...rest } = useClaimBuilderReward(builder, gauge)
  const { isClaimable: rifClaimable, error: claimRifError } = useClaimBuilderRewardsPerToken(
    builder,
    gauge,
    rifAddress,
  )
  const { isClaimable: rbtcClaimable, error: claimRbtcError } = useClaimBuilderRewardsPerToken(
    builder,
    gauge,
    rbtcAddress,
  )

  const { isClaimable: usdrifClaimable, error: claimUsdrifError } = useClaimBuilderRewardsPerToken(
    builder,
    gauge,
    usdrifAddress,
  )

  const isClaimable = rifClaimable || rbtcClaimable || usdrifClaimable
  const error = claimBuilderRewardError ?? claimRifError ?? claimRbtcError ?? claimUsdrifError

  return {
    ...rest,
    isClaimable,
    error,
  }
}

const useClaimBuilderRewardsPerToken = (builder: Address, gauge: Address, rewardToken: Address) => {
  const { error: claimBuilderRewardError, ...rest } = useClaimBuilderReward(builder, gauge, rewardToken)
  const {
    data: rewards,
    isLoading,
    error: getBuilderRewardsError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [rewardToken] })

  const isClaimable = !isLoading && rewards !== 0n
  const error = claimBuilderRewardError ?? getBuilderRewardsError

  return {
    ...rest,
    isClaimable,
    error,
  }
}

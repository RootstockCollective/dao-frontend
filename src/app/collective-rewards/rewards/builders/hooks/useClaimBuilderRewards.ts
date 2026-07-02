import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

import { useAwaitedTxReporting } from '@/app/collective-rewards/shared/hooks'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { GaugeAbi } from '@/lib/abis/tok/GaugeAbi'
import { TOKENS } from '@/lib/tokens'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'

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
    hash,
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
  const {
    isClaimable: rifClaimable,
    error: claimRifError,
    txError: rifTxError,
  } = useClaimBuilderRewardsPerToken(builder, gauge, rifAddress)
  const {
    isClaimable: rbtcClaimable,
    error: claimRbtcError,
    txError: rbtcTxError,
  } = useClaimBuilderRewardsPerToken(builder, gauge, rbtcAddress)

  const {
    isClaimable: usdrifClaimable,
    error: claimUsdrifError,
    txError: usdrifTxError,
  } = useClaimBuilderRewardsPerToken(builder, gauge, usdrifAddress)

  const isClaimable = rifClaimable || rbtcClaimable || usdrifClaimable
  const error = claimBuilderRewardError ?? claimRifError ?? claimRbtcError ?? claimUsdrifError
  // Transaction-only errors, excluding the per-token `builderRewards` read errors — for
  // consumers that must not treat a data-loading failure as a claim failure (e.g. the
  // `rewards_claim_failed` analytics capture).
  const txError = claimBuilderRewardError ?? rifTxError ?? rbtcTxError ?? usdrifTxError

  return {
    ...rest,
    isClaimable,
    error,
    txError,
  }
}

const useClaimBuilderRewardsPerToken = (builder: Address, gauge: Address, rewardToken: Address) => {
  const { error: txError, ...rest } = useClaimBuilderReward(builder, gauge, rewardToken)
  const {
    data: rewards,
    isLoading,
    error: getBuilderRewardsError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [rewardToken] })

  const isClaimable = !isLoading && rewards !== 0n
  const error = txError ?? getBuilderRewardsError

  return {
    ...rest,
    isClaimable,
    error,
    txError,
  }
}

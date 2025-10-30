import { getBackerRewardPercentage, useGetPerTokenRewards } from '@/app/collective-rewards/rewards'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { isBuilderRewardable } from '@/app/collective-rewards/utils'
import { WeiPerEther } from '@/lib/constants'
import { REWARD_TOKEN_KEYS } from '@/lib/tokens'
import { useReadBackersManager, useReadBuilderRegistry } from '@/shared/hooks/contracts'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import Big from 'big.js'
import { useMemo } from 'react'
import { Address } from 'viem'

interface UseBuilderEstimatedRewardsProps {
  builder: Address
  gauge: Address
}

interface EstimatedRewardsData {
  rif: bigint
  rbtc: bigint
  usdrif: bigint
  isLoading: boolean
  error: Error | null
}

export const useGetBuilderEstimatedRewards = ({
  builder,
  gauge,
}: UseBuilderEstimatedRewardsProps): EstimatedRewardsData => {
  const { getBuilderByAddress } = useBuilderContext()

  const {
    data: totalPotentialRewards,
    isLoading: totalPotentialRewardsLoading,
    error: totalPotentialRewardsError,
  } = useReadBackersManager({
    functionName: 'totalPotentialReward',
  })

  const {
    data: rewardShares,
    isLoading: rewardSharesLoading,
    error: rewardSharesError,
  } = useReadGauge({ address: gauge, functionName: 'rewardShares' })

  const {
    data: rawBackerRewardsPct,
    isLoading: backerRewardsPctLoading,
    error: backerRewardsPctError,
  } = useReadBuilderRegistry(
    {
      functionName: 'backerRewardPercentage',
      args: [builder],
    },
    {
      enabled: !!builder,
    },
  )

  const rewards = useGetPerTokenRewards()

  const data: Record<(typeof REWARD_TOKEN_KEYS)[number], bigint> = useMemo(() => {
    const rewardPercentageToApply = getCurrentRewardPercentage(rawBackerRewardsPct)
    const claimingBuilder = getBuilderByAddress(builder)
    const isRewardable = isBuilderRewardable(claimingBuilder?.stateFlags)

    return REWARD_TOKEN_KEYS.reduce(
      (acc, tokenKey) => {
        const { data: tokenReward } = rewards[tokenKey]

        if (!isRewardable) {
          return { ...acc, [tokenKey]: 0n }
        }

        if (!tokenReward || tokenReward === 0n) {
          return { ...acc, [tokenKey]: 0n }
        }

        if (!rewardShares || rewardShares === 0n) {
          return { ...acc, [tokenKey]: 0n }
        }

        if (!totalPotentialRewards || totalPotentialRewards === 0n) {
          return { ...acc, [tokenKey]: 0n }
        }

        const tokenEstimatedRewards = Big(tokenReward.toString())
          .mul(rewardShares.toString())
          .div(totalPotentialRewards.toString())

        const tokenEstimatedRewardsAmount = tokenEstimatedRewards
          .mul((WeiPerEther - rewardPercentageToApply).toString())
          .div(WeiPerEther.toString())

        return { ...acc, [tokenKey]: BigInt(tokenEstimatedRewardsAmount.toFixed(0, 0)) }
      },
      {} as Record<(typeof REWARD_TOKEN_KEYS)[number], bigint>,
    )
  }, [rewards, builder, getBuilderByAddress, rewardShares, totalPotentialRewards, rawBackerRewardsPct])

  const isLoading =
    Object.values(rewards).some(({ isLoading }) => isLoading) ||
    totalPotentialRewardsLoading ||
    rewardSharesLoading ||
    backerRewardsPctLoading

  const error =
    Object.values(rewards).find(({ error }) => error)?.error ??
    totalPotentialRewardsError ??
    rewardSharesError ??
    backerRewardsPctError

  return {
    ...data,
    isLoading,
    error,
  }
}

const getCurrentRewardPercentage = (rawBackerRewardsPct?: readonly [bigint, bigint, bigint]) => {
  const [current, next, cooldownEndTime] = rawBackerRewardsPct ?? [0n, 0n, 0n]
  const rewardPercentageToApply = getBackerRewardPercentage(current, next, cooldownEndTime)

  return rewardPercentageToApply.current
}

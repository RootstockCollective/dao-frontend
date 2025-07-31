import { useReadRewardDistributor } from '@/shared/hooks/contracts'
import { useMemo } from 'react'

export const useGetCycleRewards = () => {
  const {
    data: rifRewards,
    isLoading: rifRewardsLoading,
    error: rifRewardsError,
  } = useReadRewardDistributor({ functionName: 'defaultRewardTokenAmount' })
  const {
    data: rbtcRewards,
    isLoading: rbtcRewardsLoading,
    error: rbtcRewardsError,
  } = useReadRewardDistributor({ functionName: 'defaultRewardCoinbaseAmount' })

  return {
    data: useMemo(
      () => ({
        rif: rifRewards ?? 0n,
        rbtc: rbtcRewards ?? 0n,
      }),
      [rifRewards, rbtcRewards],
    ),
    isLoading: rifRewardsLoading || rbtcRewardsLoading,
    error: rifRewardsError ?? rbtcRewardsError ?? null,
  }
}

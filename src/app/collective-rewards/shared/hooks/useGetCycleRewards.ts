import { useReadRewardDistributor } from '@/shared/hooks/contracts'

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
    data: {
      rif: rifRewards ?? 0n,
      rbtc: rbtcRewards ?? 0n,
    },
    isLoading: rifRewardsLoading || rbtcRewardsLoading,
    error: rifRewardsError ?? rbtcRewardsError ?? null,
  }
}

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

  // TODO: Switch to these when we switch to v3 cr contracts
  // const {
  //   data: rifRewards,
  //   isLoading: rifRewardsLoading,
  //   error: rifRewardsError,
  // } = useReadRewardDistributor({ functionName: 'defaultRifAmount' })

  // const {
  //   data: rbtcRewards,
  //   isLoading: rbtcRewardsLoading,
  //   error: rbtcRewardsError,
  // } = useReadRewardDistributor({ functionName: 'defaultNativeAmount' })

  // const {
  //   data: usdrifRewards,
  //   isLoading: usdrifRewardsLoading,
  //   error: usdrifRewardsError,
  // } = useReadRewardDistributor({ functionName: 'defaultUsdrifAmount' })

  return {
    data: useMemo(
      () => ({
        rif: rifRewards ?? 0n,
        rbtc: rbtcRewards ?? 0n,
        usdrif: /* usdrifRewards ?? */ 0n,
      }),
      [rifRewards, rbtcRewards /* , usdrifRewards */],
    ),
    isLoading: rifRewardsLoading || rbtcRewardsLoading /* || usdrifRewardsLoading */,
    error: rifRewardsError ?? rbtcRewardsError /* ?? usdrifRewardsError */,
  }
}

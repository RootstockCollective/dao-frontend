import { parseEther } from 'viem'
import { usePricesContext } from '@/shared/context/PricesContext'
import { WeiPerEther } from 'ethers'
import { useGetRewardsCoinbase, useGetRewardsERC20 } from '@/app/collective-rewards/rewards'
import { useMemo } from 'react'

export const useGetCyclePayout = () => {
  const { prices } = usePricesContext()
  const { data: rifRewards, isLoading: rifRewardsLoading, error: rifRewardsError } = useGetRewardsERC20()
  const {
    data: rbtcRewards,
    isLoading: rbtcRewardsLoading,
    error: rbtcRewardsError,
  } = useGetRewardsCoinbase()

  const cyclePayout = useMemo(() => {
    const rifPrice = prices.RIF?.price ? parseEther(prices.RIF.price.toString()) : 0n
    const rbtcPrice = prices.RBTC?.price ? parseEther(prices.RBTC.price.toString()) : 0n
    const rifAmount = rifRewards ?? 0n
    const rbtcAmount = rbtcRewards ?? 0n
    return (rifAmount * rifPrice + rbtcAmount * rbtcPrice) / WeiPerEther
  }, [prices, rifRewards, rbtcRewards])

  return {
    cyclePayout,
    isLoading: rifRewardsLoading || rbtcRewardsLoading,
    error: rifRewardsError ?? rbtcRewardsError ?? null,
  }
}

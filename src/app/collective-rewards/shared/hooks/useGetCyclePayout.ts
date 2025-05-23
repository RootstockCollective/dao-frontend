import { WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadRewardDistributor } from '@/shared/hooks/contracts'
import { useMemo } from 'react'
import { parseEther } from 'viem'

export const useGetCyclePayout = () => {
  const { prices } = usePricesContext()
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

  const cyclePayout = useMemo(
    () => getCyclePayout(prices, rifRewards, rbtcRewards),
    [prices, rifRewards, rbtcRewards],
  )

  return {
    cyclePayout,
    isLoading: rifRewardsLoading || rbtcRewardsLoading,
    error: rifRewardsError ?? rbtcRewardsError ?? null,
  }
}

export const getCyclePayout = (
  prices: { RIF?: { price: number }; RBTC?: { price: number } },
  rifRewards: bigint | undefined,
  rbtcRewards: bigint | undefined,
) => {
  const rifPrice = prices.RIF?.price ? parseEther(prices.RIF.price.toString()) : 0n
  const rbtcPrice = prices.RBTC?.price ? parseEther(prices.RBTC.price.toString()) : 0n
  const rifAmount = rifRewards ?? 0n
  const rbtcAmount = rbtcRewards ?? 0n
  return (rifAmount * rifPrice + rbtcAmount * rbtcPrice) / WeiPerEther
}

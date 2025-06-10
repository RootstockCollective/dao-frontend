import { getBackerRewardPercentage } from '@/app/collective-rewards/rewards'
import Big from '@/lib/big'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { calculateAbi } from './useGetABI'
import { getCyclePayout } from './useGetCyclePayout'
import { Response } from '../actions'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

export const useGetMetricsAbiWithStateSync = () => {
  const {
    data: abiData,
    isLoading: abiDataIsLoading,
    error: abiDataError,
  } = useQuery<Response, Error>({
    queryFn: async () => {
      const response = await fetch('/api/metrics/abi/context')
      if (!response.ok) {
        throw new Error('Failed to fetch ABI data')
      }
      return response.json()
    },
    queryKey: ['abiData'],
    refetchInterval: AVERAGE_BLOCKTIME,
  })

  const { prices } = usePricesContext()

  const data: Big = useMemo(() => {
    if (abiDataError || !abiData?.builders || !abiData.cycles?.length) {
      return Big(0)
    }

    const { builders, cycles } = abiData
    const [{ rewardsERC20, rewardsRBTC }] = cycles
    if (!rewardsERC20 || !rewardsRBTC || !prices?.RIF?.price || !prices?.RBTC?.price) {
      return Big(0)
    }

    const cyclePayout = Big(getCyclePayout(prices, BigInt(rewardsERC20), BigInt(rewardsRBTC)).toString())

    const sumTotalAllocation = builders.reduce<Big>(
      (acc, builder) => acc.plus(Big(builder?.totalAllocation ?? 0)),
      Big(0),
    )

    if (!sumTotalAllocation) {
      return Big(0)
    }

    // We use the multiplication with the current backer rewards % to avoid losing precision
    // Thats why we don't need to multiply by 100
    const weightedAverageBuilderRewardsPct = builders
      .slice(0, 5)
      .reduce<Big>((acc, { backerRewardPercentage, totalAllocation }) => {
        const currentBackerRewardPercentage = backerRewardPercentage
          ? getBackerRewardPercentage(
              BigInt(backerRewardPercentage.previous) ?? 0n,
              BigInt(backerRewardPercentage.next) ?? 0n,
              BigInt(backerRewardPercentage.cooldownEndTime) ?? 0n,
            ).current.toString()
          : 0
        return acc.plus(Big(totalAllocation).mul(Big(currentBackerRewardPercentage)).div(sumTotalAllocation))
      }, Big(0))

    return calculateAbi(
      cyclePayout.mul(weightedAverageBuilderRewardsPct).div(sumTotalAllocation),
      prices.RIF?.price ?? 0,
    )
  }, [abiData, abiDataError, prices])

  return {
    data,
    isLoading: abiDataIsLoading,
    error: abiDataError,
  }
}

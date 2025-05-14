import { getBackerRewardPercentage } from '@/app/collective-rewards/rewards'
import Big from '@/lib/big'
import { usePricesContext } from '@/shared/context/PricesContext'
import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'
import { Address } from 'viem'
import { calculateAbi } from './useGetABI'
import { getCyclePayout } from './useGetCyclePayout'

type CycleData = {
  id: string
  rewardsERC20: string
  rewardsRBTC: string
}

type BackerRewardPercentageData = {
  id: string
  next: string
  previous: string
  cooldownEndTime: string
}

type BuilderData = {
  id: Address
  backerRewardPercentage: BackerRewardPercentageData
  rewardShares: string
  totalAllocation: string
}

const ABI_METRICS_DATA_QUERY = gql`
  query AbiMetricsData {
    builders(
      where: { state_: { kycApproved: true, communityApproved: true, initialized: true, selfPaused: false } }
      orderBy: totalAllocation
      orderDirection: desc
    ) {
      id
      totalAllocation
      backerRewardPercentage {
        id
        next
        previous
        cooldownEndTime
      }
    }
    cycles(first: 1, orderBy: id, orderDirection: desc) {
      id
      rewardsERC20
      rewardsRBTC
    }
  }
`

export const useGetMetricsAbiWithGraph = () => {
  const {
    data: abiData,
    error: abiDataError,
    ...abiDataMeta
  } = useQuery<{
    builders: BuilderData[]
    cycles: CycleData[]
  }>(ABI_METRICS_DATA_QUERY)
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
    isLoading: abiDataMeta.loading,
    error: abiDataError,
  }
}

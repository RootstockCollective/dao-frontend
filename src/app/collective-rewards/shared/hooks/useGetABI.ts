import Big from '@/lib/big'
import { WeiPerEther } from '@/lib/constants'
import { RBTC, RIF } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useMemo } from 'react'
import { Address } from 'viem'
import { getBackerRewardPercentage } from '@/app/collective-rewards/rewards'
import { getCyclePayout } from './getCyclePayout'
import { isBuilderRewardable } from '../../utils'
import { BuilderStateFlags } from '../../types'

type CycleData = {
  id: string
  rewardsERC20: string
  rewardsRBTC: string
}

type BackerRewardPercentageData = {
  next: string
  previous: string
  cooldownEndTime: string
}

export type BuilderData = {
  address: Address
  backerRewardPct: BackerRewardPercentageData
  totalAllocation: string
  stateFlags: BuilderStateFlags
}

export type AbiData = {
  builders: BuilderData[]
  cycles: CycleData[]
}

export const calculateAbi = (rewardsPerStRif: Big, rifPrice: number): Big => {
  if (!rifPrice) {
    return Big(0)
  }

  return Big(1).add(rewardsPerStRif.div(WeiPerEther.toString()).div(rifPrice)).pow(26).minus(1).mul(100)
}

export const useGetABI = (abiData: AbiData | undefined) => {
  const { prices } = usePricesContext()

  return useMemo(() => {
    if (!abiData?.builders || !abiData.cycles?.length) {
      return Big(0)
    }

    const { builders, cycles } = abiData
    const [{ rewardsERC20, rewardsRBTC }] = cycles

    const rifPrice = prices[RIF]?.price ?? 0
    const rbtcPrice = prices[RBTC]?.price ?? 0

    const cyclePayout = Big(
      getCyclePayout(rifPrice, rbtcPrice, BigInt(rewardsERC20), BigInt(rewardsRBTC)).toString(),
    )

    const sumTotalAllocation = builders.reduce<Big>(
      (acc, builder) => acc.plus(Big(builder?.totalAllocation ?? 0)),
      Big(0),
    )

    if (sumTotalAllocation.eq(0)) {
      return Big(0)
    }

    // We use the multiplication with the current backer rewards % to avoid losing precision
    // Thats why we don't need to multiply by 100
    const top5Builders = builders.filter(b => isBuilderRewardable(b.stateFlags)).slice(0, 5)
    const top5BuildersTotalAllocation = top5Builders.reduce<Big>(
      (acc, { totalAllocation }) => acc.plus(Big(totalAllocation)),
      Big(0),
    )
    const weightedAverageBuilderRewardsPct = top5Builders.reduce<Big>(
      (acc, { backerRewardPct, totalAllocation }) => {
        const currentBackerRewardPercentage = backerRewardPct
          ? getBackerRewardPercentage(
              BigInt(backerRewardPct.previous ?? 0n),
              BigInt(backerRewardPct.next ?? 0n),
              BigInt(backerRewardPct.cooldownEndTime ?? 0n),
            ).current.toString()
          : 0
        return acc.plus(
          Big(totalAllocation).mul(Big(currentBackerRewardPercentage)).div(top5BuildersTotalAllocation),
        )
      },
      Big(0),
    )

    const rewardsPerStRif = cyclePayout.mul(weightedAverageBuilderRewardsPct).div(sumTotalAllocation)

    return calculateAbi(rewardsPerStRif, rifPrice)
  }, [abiData, prices])
}

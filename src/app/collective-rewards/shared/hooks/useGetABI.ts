import Big from '@/lib/big'
import { RBTC, RIF, USDRIF, WeiPerEther, ABI_CYCLES_LIMIT } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useMemo } from 'react'
import { Address } from 'viem'
import { getBackerRewardPercentage } from '@/app/collective-rewards/rewards'
import { getCyclePayout } from './getCyclePayout'
import { isBuilderRewardable } from '../../utils'
import { BuilderStateFlags } from '../../types'
import { TOKENS } from '@/lib/tokens'

export type CycleData = {
  id: string
  rewardPerToken: Record<string, string>
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

    const rifPrice = prices[RIF]?.price ?? 0
    const rbtcPrice = prices[RBTC]?.price ?? 0
    const usdrifPrice = prices[USDRIF]?.price ?? 0

    // Compute the average cycle payout for the last cycles (limited by ABI_CYCLES_LIMIT)
    const lastCycles = cycles.slice(0, ABI_CYCLES_LIMIT)
    const cyclePayout =
      lastCycles.length === 0
        ? Big(0)
        : lastCycles
            .map(cycle => {
              const rewardPerToken = cycle.rewardPerToken
              return Big(
                getCyclePayout(
                  rifPrice,
                  rbtcPrice,
                  usdrifPrice,
                  BigInt(rewardPerToken[TOKENS.rif.address.toLowerCase()] ?? 0n),
                  BigInt(rewardPerToken[TOKENS.rbtc.address.toLowerCase()] ?? 0n),
                  BigInt(rewardPerToken[TOKENS.usdrif.address.toLowerCase()] ?? 0n),
                ).toString(),
              )
            })
            .reduce((acc, payout) => acc.plus(payout), Big(0))
            .div(lastCycles.length)

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

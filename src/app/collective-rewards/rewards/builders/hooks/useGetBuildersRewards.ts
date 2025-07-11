import { Allocations, AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { useCycleContext } from '@/app/collective-rewards/metrics'
import {
  BackerRewardPercentage,
  getNotifyRewardAmount,
  RbtcSvg,
  RifSvg,
  Token,
  TokenRewards,
  useGetGaugesNotifyReward,
  useGetLastCycleDistribution,
} from '@/app/collective-rewards/rewards'
import { useGetEstimatedRewardsPct } from '@/app/collective-rewards/shared'
import { RequiredBuilder } from '@/app/collective-rewards/types'
import { WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadGauges, useReadRewardDistributor } from '@/shared/hooks/contracts'
import { useContext, useMemo } from 'react'

const isBuilderShown = (
  { stateFlags: { kycApproved, revoked, communityApproved, paused }, address }: RequiredBuilder,
  allocations: Allocations,
) => {
  const allocation = allocations[address]
  return (kycApproved && !revoked && communityApproved && !paused) || (allocation && allocation > 0n)
}

export type BuildersRewards = RequiredBuilder & {
  totalAllocationPercentage: bigint
  rewardPercentage: BackerRewardPercentage
  lastCycleRewards: TokenRewards
  estimatedRewards: TokenRewards
}

export const useGetBuildersRewards = ({ rif, rbtc }: { [token: string]: Token }, currency = 'USD') => {
  const {
    initialState: { allocations },
  } = useContext(AllocationsContext)
  const { data: cycle, isLoading: cycleLoading, error: cycleError } = useCycleContext()
  const {
    data: builders,
    isLoading: estimatedRewardsPctLoading,
    error: estimatedRewardsPctError,
  } = useGetEstimatedRewardsPct()

  // get the total allocation for all the builders
  const gauges = useMemo(() => builders.map(({ gauge }) => gauge), [builders])
  const {
    data: totalAllocation,
    isLoading: totalAllocationLoading,
    error: totalAllocationError,
  } = useReadGauges({ addresses: gauges, functionName: 'totalAllocation' })

  const {
    data: rewardsERC20,
    isLoading: rewardsERC20Loading,
    error: rewardsERC20Error,
  } = useReadRewardDistributor({ functionName: 'defaultRewardTokenAmount' })

  const {
    data: rewardsCoinbase,
    isLoading: rewardsCoinbaseLoading,
    error: rewardsCoinbaseError,
  } = useReadRewardDistributor({ functionName: 'defaultRewardCoinbaseAmount' })

  const {
    data: { fromTimestamp, toTimestamp },
    isLoading: lastCycleRewardsLoading,
    error: lastCycleRewardsError,
  } = useGetLastCycleDistribution(cycle)

  const {
    data: notifyRewardEventLastCycle,
    isLoading: logsLoading,
    error: logsError,
  } = useGetGaugesNotifyReward(gauges, undefined, fromTimestamp, toTimestamp)

  const isLoading =
    estimatedRewardsPctLoading ||
    totalAllocationLoading ||
    logsLoading ||
    rewardsERC20Loading ||
    rewardsCoinbaseLoading ||
    cycleLoading ||
    lastCycleRewardsLoading

  const error =
    estimatedRewardsPctError ??
    totalAllocationError ??
    logsError ??
    rewardsERC20Error ??
    rewardsCoinbaseError ??
    cycleError ??
    lastCycleRewardsError

  const { prices } = usePricesContext()

  const data = useMemo(() => {
    const rifPrice = prices[rif.symbol]?.price ?? 0
    const rbtcPrice = prices[rbtc.symbol]?.price ?? 0
    const sumTotalAllocation = Object.values(totalAllocation).reduce<bigint>(
      (acc, value) => acc + (value ?? 0n),
      0n,
    )
    const rifBuildersRewardsAmount = getNotifyRewardAmount(
      notifyRewardEventLastCycle,
      rif.address,
      'backersAmount_',
    )
    const rbtcBuildersRewardsAmount = getNotifyRewardAmount(
      notifyRewardEventLastCycle,
      rbtc.address,
      'backersAmount_',
    )

    return builders.reduce<BuildersRewards[]>((acc, builder, i) => {
      const { gauge, rewardPercentage, estimatedBackerRewardsPct } = builder

      const isShown = isBuilderShown(builder, allocations)
      if (!isShown) return acc

      // calculate rif estimated rewards
      const rewardRif = rewardsERC20 ?? 0n
      const estimatedRifAmount = (estimatedBackerRewardsPct * rewardRif) / WeiPerEther

      // calculate rbtc estimated rewards
      const rewardRbtc = rewardsCoinbase ?? 0n
      const estimatedRbtcAmount = (estimatedBackerRewardsPct * rewardRbtc) / WeiPerEther

      const builderTotalAllocation = totalAllocation[i] ?? 0n
      const totalAllocationPercentage = sumTotalAllocation
        ? (builderTotalAllocation * 100n) / sumTotalAllocation
        : 0n

      const rifLastCycleRewardsAmount = rifBuildersRewardsAmount[gauge] ?? 0n
      const rbtcLastCycleRewardsAmount = rbtcBuildersRewardsAmount[gauge] ?? 0n

      return [
        ...acc,
        {
          ...builder,
          totalAllocationPercentage,
          rewardPercentage,
          lastCycleRewards: {
            rif: {
              amount: {
                value: rifLastCycleRewardsAmount,
                price: rifPrice,
                symbol: rif.symbol,
                currency,
              },
              logo: RifSvg(),
            },
            rbtc: {
              amount: {
                value: rbtcLastCycleRewardsAmount,
                price: rbtcPrice,
                symbol: rbtc.symbol,
                currency,
              },
              logo: RbtcSvg(),
            },
          },
          estimatedRewards: {
            rif: {
              amount: {
                value: estimatedRifAmount,
                price: rifPrice,
                symbol: rif.symbol,
                currency,
              },
              logo: RifSvg(),
            },
            rbtc: {
              amount: {
                value: estimatedRbtcAmount,
                price: rbtcPrice,
                symbol: rbtc.symbol,
                currency,
              },
              logo: RbtcSvg(),
            },
          },
        },
      ]
    }, [])
  }, [
    builders,
    allocations,
    currency,
    rif,
    rbtc,
    rewardsERC20,
    rewardsCoinbase,
    totalAllocation,
    notifyRewardEventLastCycle,
    prices,
  ])

  return {
    data,
    isLoading,
    error,
  }
}

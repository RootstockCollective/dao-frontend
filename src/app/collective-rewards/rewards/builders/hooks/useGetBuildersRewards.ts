import { useCycleContext } from '@/app/collective-rewards/metrics'
import {
  getNotifyRewardAmount,
  Token,
  useGetBackersRewardPercentage,
  useGetGaugesNotifyReward,
  useGetRewardsCoinbase,
  useGetRewardsERC20,
  useGetTotalPotentialReward,
  RifSvg,
  RbtcSvg,
  TokenRewards,
  BackerRewardPercentage,
  useGetLastCycleDistribution,
} from '@/app/collective-rewards/rewards'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useGaugesGetFunction } from '@/app/collective-rewards/shared'
import { BuilderStateFlags, RequiredBuilder } from '@/app/collective-rewards/types'
import { useGetBuildersByState } from '@/app/collective-rewards/user'
import { Address, parseUnits } from 'viem'
import { Allocations, AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { useContext, useMemo } from 'react'
import { isBuilderRewardable } from '@/app/collective-rewards//utils'

const isBuilderShown = (
  { stateFlags: { kycApproved, revoked, communityApproved, paused }, address }: RequiredBuilder,
  allocations: Allocations,
) => {
  const allocation = allocations[address]
  return (kycApproved && !revoked && communityApproved && !paused) || (allocation && allocation > 0n)
}

// FIXME: remove and use Builder and/or combination of existing types
export type BuildersRewards = {
  address: Address
  builderName: string
  stateFlags: BuilderStateFlags
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
    isLoading: searchLoading,
    error: searchError,
  } = useGetBuildersByState<RequiredBuilder>()

  const {
    data: totalPotentialRewards,
    isLoading: totalPotentialRewardsLoading,
    error: totalPotentialRewardsError,
  } = useGetTotalPotentialReward()

  // get the total allocation for all the builders
  const gauges = builders.map(({ gauge }) => gauge)
  const {
    data: totalAllocation,
    isLoading: totalAllocationLoading,
    error: totalAllocationError,
  } = useGaugesGetFunction(gauges, 'totalAllocation')

  const {
    data: rewardShares,
    isLoading: rewardSharesLoading,
    error: rewardSharesError,
  } = useGaugesGetFunction(gauges, 'rewardShares')

  const {
    data: rewardsERC20,
    isLoading: rewardsERC20Loading,
    error: rewardsERC20Error,
  } = useGetRewardsERC20()

  const {
    data: rewardsCoinbase,
    isLoading: rewardsCoinbaseLoading,
    error: rewardsCoinbaseError,
  } = useGetRewardsCoinbase()

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

  // get the backer reward percentage for each builder we want to show
  const buildersAddress = builders.map(({ address }) => address)
  const {
    data: backersRewardsPct,
    isLoading: backersRewardsPctLoading,
    error: backersRewardsPctError,
  } = useGetBackersRewardPercentage(buildersAddress, cycle.cycleNext.toSeconds())

  const isLoading =
    rewardSharesLoading ||
    searchLoading ||
    totalAllocationLoading ||
    logsLoading ||
    backersRewardsPctLoading ||
    rewardsERC20Loading ||
    rewardsCoinbaseLoading ||
    cycleLoading ||
    totalPotentialRewardsLoading ||
    lastCycleRewardsLoading

  const error =
    rewardSharesError ??
    searchError ??
    totalAllocationError ??
    logsError ??
    backersRewardsPctError ??
    rewardsERC20Error ??
    rewardsCoinbaseError ??
    cycleError ??
    totalPotentialRewardsError ??
    lastCycleRewardsError

  const { prices } = usePricesContext()

  const rifPrice = prices[rif.symbol]?.price ?? 0
  const rbtcPrice = prices[rbtc.symbol]?.price ?? 0

  const data = useMemo(() => {
    return builders.reduce<BuildersRewards[]>((acc, builder) => {
      const { address, builderName, gauge, stateFlags } = builder

      const isShown = isBuilderShown(builder, allocations)
      if (!isShown) return acc

      const builderRewardShares = rewardShares[gauge] ?? 0n
      const rewardPercentage = backersRewardsPct[address] ?? null
      const rewardPercentageToApply = rewardPercentage?.current ?? 0n

      const weiPerEther = parseUnits('1', 18)

      const isRewarded = isBuilderRewardable(stateFlags)

      // calculate rif estimated rewards
      const rewardRif = rewardsERC20 ?? 0n
      const rewardsAmountRif =
        isRewarded && totalPotentialRewards ? (rewardRif * builderRewardShares) / totalPotentialRewards : 0n
      const estimatedRifAmount = (rewardsAmountRif * rewardPercentageToApply) / weiPerEther

      // calculate rbtc estimated rewards
      const rewardRbtc = rewardsCoinbase ?? 0n
      const rewardsAmountRbtc =
        isRewarded && totalPotentialRewards ? (rewardRbtc * builderRewardShares) / totalPotentialRewards : 0n
      const estimatedRbtcAmount = (rewardsAmountRbtc * rewardPercentageToApply) / weiPerEther

      const sumTotalAllocation = Object.values(totalAllocation).reduce(
        (acc, value) => acc + (value ?? 0n),
        0n,
      )
      const totalAllocationPercentage = sumTotalAllocation
        ? (totalAllocation[gauge] * 100n) / sumTotalAllocation
        : 0n

      const rifLastCycleRewardsAmount = rifBuildersRewardsAmount[gauge] ?? 0n
      const rbtcLastCycleRewardsAmount = rbtcBuildersRewardsAmount[gauge] ?? 0n

      return [
        ...acc,
        {
          address,
          builderName,
          stateFlags,
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
    rewardShares,
    totalPotentialRewards,
    backersRewardsPct,
    rifBuildersRewardsAmount,
    rbtcBuildersRewardsAmount,
    rifPrice,
    rbtcPrice,
    currency,
    rif,
    rbtc,
    rewardsERC20,
    rewardsCoinbase,
    totalAllocation,
  ])

  return {
    data,
    isLoading,
    error,
  }
}

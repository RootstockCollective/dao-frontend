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
  BuilderRewardPercentage,
  TokenRewards,
} from '@/app/collective-rewards/rewards'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useGaugesGetFunction } from '@/app/collective-rewards/shared'
import { Builder, BuilderStateFlags } from '@/app/collective-rewards/types'
import { useGetBuildersByState } from '@/app/collective-rewards/user'
import { Address } from 'viem'
import { Allocations, AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { useContext, useMemo } from 'react'

type RequiredBuilder = Required<Builder>

// from the builders list, filter out the builders that are not kycApproved or are revoked or have no allocation
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
  rewardPercentage: BuilderRewardPercentage
  lastCycleReward: TokenRewards
  estimatedReward: TokenRewards
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

  const sumTotalAllocation = Object.values(totalAllocation ?? {}).reduce(
    (acc, value) => acc + (value ?? 0n),
    0n,
  )

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

  const { cycleDuration, cycleStart, endDistributionWindow, cycleNext } = cycle
  const distributionWindow = endDistributionWindow.diff(cycleStart)
  const lastCycleStart = cycleStart.minus({ seconds: cycleDuration.as('seconds') })
  const lastCycleAfterDistribution = lastCycleStart.plus({ seconds: distributionWindow.as('seconds') })

  const {
    data: notifyRewardEventLastCycle,
    isLoading: logsLoading,
    error: logsError,
  } = useGetGaugesNotifyReward(
    gauges,
    undefined,
    lastCycleAfterDistribution.toSeconds(),
    endDistributionWindow.toSeconds(),
  )
  const rifBuildersRewardsAmount = getNotifyRewardAmount(notifyRewardEventLastCycle, rif, 'builderAmount_')
  const rbtcBuildersRewardsAmount = getNotifyRewardAmount(notifyRewardEventLastCycle, rbtc, 'builderAmount_')

  // get the backer reward percentage for each builder we want to show
  const buildersAddress = builders.map(({ address }) => address)
  const {
    data: backersRewardsPct,
    isLoading: backersRewardsPctLoading,
    error: backersRewardsPctError,
  } = useGetBackersRewardPercentage(buildersAddress, cycleNext.toSeconds())

  const isLoading =
    rewardSharesLoading ||
    searchLoading ||
    totalAllocationLoading ||
    logsLoading ||
    backersRewardsPctLoading ||
    rewardsERC20Loading ||
    rewardsCoinbaseLoading ||
    cycleLoading ||
    totalPotentialRewardsLoading

  const error =
    rewardSharesError ??
    searchError ??
    totalAllocationError ??
    logsError ??
    backersRewardsPctError ??
    rewardsERC20Error ??
    rewardsCoinbaseError ??
    cycleError ??
    totalPotentialRewardsError

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
      const rewardPercentageToApply = rewardPercentage?.current ?? 0

      // calculate rif estimated rewards
      const rewardRif = rewardsERC20 ?? 0n
      const rewardsAmountRif = totalPotentialRewards
        ? (rewardRif * builderRewardShares) / totalPotentialRewards
        : 0n
      const estimatedRifInHuman =
        Number(formatBalanceToHuman(rewardsAmountRif)) * (rewardPercentageToApply / 100)

      // calculate rbtc estimated rewards
      const rewardRbtc = rewardsCoinbase ?? 0n
      const rewardsAmountRbtc = totalPotentialRewards
        ? (rewardRbtc * builderRewardShares) / totalPotentialRewards
        : 0n
      const estimatedRbtcInHuman =
        Number(formatBalanceToHuman(rewardsAmountRbtc)) * (rewardPercentageToApply / 100)

      const totalAllocationPercentage = sumTotalAllocation
        ? (totalAllocation[gauge] * 100n) / sumTotalAllocation
        : 0n

      const rifBuilderRewardsAmount = Number(formatBalanceToHuman(rifBuildersRewardsAmount[gauge] ?? 0n))
      const rbtcBuilderRewardsAmount = Number(formatBalanceToHuman(rbtcBuildersRewardsAmount[gauge] ?? 0n))

      return [
        ...acc,
        {
          address,
          builderName,
          stateFlags,
          totalAllocationPercentage,
          rewardPercentage,
          lastCycleReward: {
            rif: {
              crypto: { value: rifBuilderRewardsAmount, symbol: rif.symbol },
              fiat: {
                value: rifPrice * rifBuilderRewardsAmount,
                symbol: currency,
              },
              logo: RifSvg(),
            },
            rbtc: {
              crypto: { value: rbtcBuilderRewardsAmount, symbol: rbtc.symbol },
              fiat: {
                value: rbtcPrice * rbtcBuilderRewardsAmount,
                symbol: currency,
              },
              logo: RbtcSvg(),
            },
          },
          estimatedReward: {
            rif: {
              crypto: { value: estimatedRifInHuman, symbol: rif.symbol },
              fiat: {
                value: rifPrice * estimatedRifInHuman,
                symbol: currency,
              },
              logo: RifSvg(),
            },
            rbtc: {
              crypto: { value: estimatedRbtcInHuman, symbol: rbtc.symbol },
              fiat: {
                value: rbtcPrice * estimatedRbtcInHuman,
                symbol: currency,
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
    sumTotalAllocation,
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

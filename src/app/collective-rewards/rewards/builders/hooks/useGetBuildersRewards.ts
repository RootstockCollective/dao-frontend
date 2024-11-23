import { useCycleContext } from '@/app/collective-rewards/metrics'
import {
  getNotifyRewardAmount,
  Token,
  useGetBuildersRewardPercentage,
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
import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { useContext } from 'react'

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
    state: { getBuilderIndexByAddress },
  } = useContext(AllocationsContext)
  let {
    data: builders,
    isLoading: searchLoading,
    error: searchError,
  } = useGetBuildersByState<Required<Builder>>()

  const filteredBuilders = builders.filter(({ address, stateFlags }) => {
    if (!stateFlags.kycApproved || stateFlags.revoked) {
      const allocation = allocations[getBuilderIndexByAddress(address)]
      if (!allocation || allocation === 0n) return false
    }

    return true
  })

  const {
    data: totalPotentialRewards,
    isLoading: totalPotentialRewardsLoading,
    error: totalPotentialRewardsError,
  } = useGetTotalPotentialReward()

  const buildersAddress = builders.map(({ address }) => address)
  const {
    data: buildersRewardsPct,
    isLoading: buildersRewardsPctLoading,
    error: buildersRewardsPctError,
  } = useGetBuildersRewardPercentage(buildersAddress)

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

  const { data: cycle, isLoading: cycleLoading, error: cycleError } = useCycleContext()
  const { cycleDuration, cycleStart, endDistributionWindow } = cycle
  const distributionWindow = endDistributionWindow.diff(cycleStart)
  const lastCycleStart = cycleStart.minus({ millisecond: cycleDuration.as('millisecond') })
  const lastCycleAfterDistribution = lastCycleStart.plus({ millisecond: +distributionWindow })

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

  const isLoading =
    rewardSharesLoading ||
    searchLoading ||
    totalAllocationLoading ||
    logsLoading ||
    buildersRewardsPctLoading ||
    rewardsERC20Loading ||
    rewardsCoinbaseLoading ||
    cycleLoading ||
    totalPotentialRewardsLoading

  const error =
    rewardSharesError ??
    searchError ??
    totalAllocationError ??
    logsError ??
    buildersRewardsPctError ??
    rewardsERC20Error ??
    rewardsCoinbaseError ??
    cycleError ??
    totalPotentialRewardsError

  const { prices } = usePricesContext()

  const rifPrice = prices[rif.symbol]?.price ?? 0
  const rbtcPrice = prices[rbtc.symbol]?.price ?? 0

  const data: BuildersRewards[] = filteredBuilders.map(({ address, builderName, gauge, stateFlags }) => {
    const builderRewardShares = rewardShares[gauge] ?? 0n
    const rewardPercentage = buildersRewardsPct[address] ?? null
    const currentRewardPercentage = rewardPercentage?.current ?? 0

    // calculate rif estimated rewards
    const rewardRif = rewardsERC20 ?? 0n
    const rewardsAmountRif = totalPotentialRewards
      ? rewardRif * (builderRewardShares / totalPotentialRewards)
      : 0n
    const estimatedRifInHuman =
      Number(formatBalanceToHuman(rewardsAmountRif)) * (currentRewardPercentage / 100)

    // calculate rbtc estimated rewards
    const rewardRbtc = rewardsCoinbase ?? 0n
    const rewardsAmountRbtc = totalPotentialRewards
      ? rewardRbtc * (builderRewardShares / totalPotentialRewards)
      : 0n
    const estimatedRbtcInHuman =
      Number(formatBalanceToHuman(rewardsAmountRbtc)) * (currentRewardPercentage / 100)

    const totalAllocationPercentage = sumTotalAllocation
      ? (totalAllocation[gauge] * 100n) / sumTotalAllocation
      : 0n
    const rifBuilderRewardsAmount = Number(formatBalanceToHuman(rifBuildersRewardsAmount[gauge] ?? 0n))
    const rbtcBuilderRewardsAmount = Number(formatBalanceToHuman(rbtcBuildersRewardsAmount[gauge] ?? 0n))

    return {
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
    }
  })

  return {
    data,
    isLoading,
    error,
  }
}

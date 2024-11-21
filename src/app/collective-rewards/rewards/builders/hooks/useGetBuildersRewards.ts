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
} from '@/app/collective-rewards/rewards'
import { useGetFilteredBuilders } from '@/app/collective-rewards/whitelist'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useGaugesGetFunction } from '@/app/collective-rewards/shared'

export const useGetBuildersRewards = ({ rif, rbtc }: { [token: string]: Token }, currency = 'USD') => {
  const {
    data: activeBuilders,
    isLoading: activeBuildersLoading,
    error: activeBuildersError,
  } = useGetFilteredBuilders({ builderName: '', status: 'all' })

  const {
    data: totalPotentialRewards,
    isLoading: totalPotentialRewardsLoading,
    error: totalPotentialRewardsError,
  } = useGetTotalPotentialReward()

  const buildersAddress = activeBuilders?.map(({ address }) => address)
  const {
    data: buildersRewardsPct,
    isLoading: buildersRewardsPctLoading,
    error: buildersRewardsPctError,
  } = useGetBuildersRewardPercentage(buildersAddress)

  // TODO: validate what do to here
  // Leaderboard only shows active builders or inactive builders that the backer allocated to
  /* const activeOrAllocatedBuilders = activeBuilders?.filter(
      (builder, i) => builder.status === 'Active' || (allBackerAllocations && allBackerAllocations?.[i] > 0n),
    ) */

  const gauges = activeBuilders?.map(({ gauge }) => gauge)
  const {
    data: totalAllocation,
    isLoading: totalAllocationLoading,
    error: totalAllocationError,
  } = useGaugesGetFunction(gauges, 'totalAllocation')
  const sumTotalAllocation = Object.values(totalAllocation ?? {}).reduce((acc, value) => acc + value, 0n)

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
    activeBuildersLoading ||
    totalAllocationLoading ||
    logsLoading ||
    buildersRewardsPctLoading ||
    rewardsERC20Loading ||
    rewardsCoinbaseLoading ||
    cycleLoading ||
    totalPotentialRewardsLoading

  const error =
    rewardSharesError ??
    activeBuildersError ??
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

  return {
    data: activeBuilders.map(({ address, builderName, gauge, stateDetails }) => {
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
        stateDetails,
        totalAllocationPercentage,
        rewardPercentage,
        lastCycleReward: {
          RIF: {
            crypto: { value: rifBuilderRewardsAmount, symbol: rif.symbol },
            fiat: {
              value: rifPrice * rifBuilderRewardsAmount,
              symbol: currency,
            },
            logo: RifSvg(),
          },
          RBTC: {
            crypto: { value: rbtcBuilderRewardsAmount, symbol: rbtc.symbol },
            fiat: {
              value: rbtcPrice * rbtcBuilderRewardsAmount,
              symbol: currency,
            },
            logo: RbtcSvg(),
          },
        },
        estimatedReward: {
          RIF: {
            crypto: { value: estimatedRifInHuman, symbol: rif.symbol },
            fiat: {
              value: rifPrice * estimatedRifInHuman,
              symbol: currency,
            },
            logo: RifSvg(),
          },
          RBTC: {
            crypto: { value: estimatedRbtcInHuman, symbol: rbtc.symbol },
            fiat: {
              value: rbtcPrice * estimatedRbtcInHuman,
              symbol: currency,
            },
            logo: RbtcSvg(),
          },
        },
      }
    }),
    isLoading,
    error,
  }
}

import { useCycleContext } from '@/app/collective-rewards/metrics'
import {
  getBackersClaimedRewardsAmount,
  useGetBuildersRewardPercentage,
  useGetGaugesBackerRewardsClaimed,
  useGetGaugesRewardShares,
  useGetRewardsCoinbase,
  useGetRewardsERC20,
  useGetTotalAllocations,
  useGetTotalPotentialReward,
} from '@/app/collective-rewards/rewards'
import { useGetFilteredBuilders } from '@/app/collective-rewards/whitelist'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { RBTC, RIF, USD } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'

export const useGetBuildersRewards = () => {
  const {
    data: activeBuilders,
    isLoading: activeBuildersLoading,
    error: activeBuildersError,
  } = useGetFilteredBuilders({ builderName: '', status: 'Active' })

  const {
    data: totalPotentialRewards,
    isLoading: totalPotentialRewardsLoading,
    error: totalPotentialRewardsError,
  } = useGetTotalPotentialReward()

  const buildersAddress = activeBuilders?.map(({ address }) => address)
  const {
    data: buildersRewardsPercentage,
    isLoading: rewardsPercentageLoading,
    error: rewardsPercentageError,
  } = useGetBuildersRewardPercentage(buildersAddress)

  const gauges = activeBuilders?.map(({ gauge }) => gauge)
  const {
    data: { allocationsPercentage },
    isLoading: allocationsLoading,
    error: allocationsError,
  } = useGetTotalAllocations(gauges)

  const {
    data: rewardShares,
    isLoading: rewardSharesLoading,
    error: rewardSharesError,
  } = useGetGaugesRewardShares(gauges)

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
  const { cycleDuration, cycleStart } = cycle
  const lastCycleStart = cycleStart?.minus({ millisecond: +cycleDuration })

  const {
    data: backersClaimedEventsLastCycle,
    isLoading: logsLoading,
    error: logsError,
  } = useGetGaugesBackerRewardsClaimed(
    gauges,
    undefined,
    undefined,
    lastCycleStart?.toSeconds() || undefined,
    lastCycleStart?.toSeconds() + cycleDuration?.toSeconds() || undefined,
  )

  const backersClaimedAmounts = getBackersClaimedRewardsAmount(gauges, backersClaimedEventsLastCycle)

  const isLoading =
    rewardSharesLoading ||
    activeBuildersLoading ||
    allocationsLoading ||
    logsLoading ||
    rewardsPercentageLoading ||
    rewardsERC20Loading ||
    rewardsCoinbaseLoading ||
    cycleLoading ||
    totalPotentialRewardsLoading

  const error =
    rewardSharesError ??
    activeBuildersError ??
    allocationsError ??
    logsError ??
    rewardsPercentageError ??
    rewardsERC20Error ??
    rewardsCoinbaseError ??
    cycleError ??
    totalPotentialRewardsError

  const { prices } = usePricesContext()

  const priceRif = prices[RIF]?.price ?? 0
  const priceRbtc = prices[RBTC]?.price ?? 0

  return {
    data: activeBuilders.map(({ address, builderName }, i) => {
      const builderRewardShares = rewardShares ? rewardShares[i] : 0n
      const rewardPercentage = buildersRewardsPercentage?.[i] ?? null
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

      const totalAllocationPercentage = allocationsPercentage?.[i] ?? 0n
      const backerClaimedAmount = backersClaimedAmounts[gauges[i]]

      return {
        address,
        builderName,
        totalAllocationPercentage,
        rewardPercentage,
        lastCycleReward: {
          RIF: {
            crypto: { value: backerClaimedAmount.RIF, symbol: RIF },
            fiat: {
              value: priceRif * backerClaimedAmount.RIF,
              symbol: USD,
            },
          },
          RBTC: {
            crypto: { value: backerClaimedAmount.RBTC, symbol: RBTC },
            fiat: {
              value: priceRbtc * backerClaimedAmount.RBTC,
              symbol: USD,
            },
          },
        },
        estimatedReward: {
          RIF: {
            crypto: { value: estimatedRifInHuman, symbol: RIF },
            fiat: {
              value: priceRif * estimatedRifInHuman,
              symbol: USD,
            },
          },
          RBTC: {
            crypto: { value: estimatedRbtcInHuman, symbol: RBTC },
            fiat: {
              value: priceRbtc * estimatedRbtcInHuman,
              symbol: USD,
            },
          },
        },
      }
    }),
    isLoading,
    error,
  }
}

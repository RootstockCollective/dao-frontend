import { useGetBackersClaimedRewardsAmount } from '@/app/collective-rewards/rewards/backers/hooks/useGetBackersClaimedRewardsAmount'
import {
  useGetBuildersRewardPercentage,
  useGetGaugesBackerRewardsClaimed,
  useGetGaugesRewardShares,
  useGetRewardsCoinbase,
  useGetRewardsERC20,
  useGetTotalAllocations,
} from '@/app/collective-rewards/rewards'
import { getPreviousCycle } from '@/app/collective-rewards/utils/getPreviousCycle'
import { useGetFilteredBuilders } from '@/app/collective-rewards/whitelist'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { RBTC, RIF, USD } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'

export const useGetBuildersRewards = () => {
  const {
    data: whitelistedBuilders,
    isLoading: whitelistedBuildersLoading,
    error: whitelistedBuildersError,
  } = useGetFilteredBuilders({ builderName: '', status: 'Active' })

  const buildersAddress = whitelistedBuilders?.map(({ address }) => address)
  const {
    data: buildersRewardsPercentage,
    isLoading: rewardsPercentageLoading,
    error: rewardsPercentageError,
  } = useGetBuildersRewardPercentage(buildersAddress)

  const gauges = whitelistedBuilders?.map(({ gauge }) => gauge)
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

  const { cycleStartTimestamp, cycleEndTimestamp } = getPreviousCycle()
  const {
    data: backersClaimedEventsLastCycle,
    isLoading: logsLoading,
    error: logsError,
  } = useGetGaugesBackerRewardsClaimed(
    gauges,
    undefined,
    undefined,
    cycleStartTimestamp.toSeconds(),
    cycleEndTimestamp.toSeconds(),
  )

  const backersClaimedAmounts = useGetBackersClaimedRewardsAmount(gauges, backersClaimedEventsLastCycle)

  const isLoading =
    rewardSharesLoading ||
    whitelistedBuildersLoading ||
    allocationsLoading ||
    logsLoading ||
    rewardsPercentageLoading ||
    rewardsERC20Loading ||
    rewardsCoinbaseLoading

  const error =
    rewardSharesError ??
    whitelistedBuildersError ??
    allocationsError ??
    logsError ??
    rewardsPercentageError ??
    rewardsERC20Error ??
    rewardsCoinbaseError

  const { prices } = usePricesContext()

  const priceRif = prices[RIF]?.price ?? 0
  const priceRbtc = prices[RBTC]?.price ?? 0

  return {
    data: whitelistedBuilders.map(({ address, builderName }, i) => {
      const projectedRif = rewardShares && rewardsERC20 ? rewardShares[i] * rewardsERC20 : 0n
      const projectedRifInHuman = Number(formatBalanceToHuman(projectedRif))

      const projectedRbtc = rewardShares && rewardsCoinbase ? rewardShares[i] * rewardsCoinbase : 0n
      const projectedRbtcInHuman = Number(formatBalanceToHuman(projectedRbtc))

      const share = allocationsPercentage?.[i] ?? 0n
      const rewardPercentage = buildersRewardsPercentage?.[i] ?? null
      const gauge = gauges[i]

      return {
        address,
        builderName,
        share,
        rewardPercentage,
        lastCycleReward: {
          RIF: {
            crypto: { value: backersClaimedAmounts[gauge].RIF, symbol: RIF },
            fiat: {
              value: priceRif * backersClaimedAmounts[gauge].RIF,
              symbol: USD,
            },
          },
          RBTC: {
            crypto: { value: backersClaimedAmounts[gauge].RBTC, symbol: RBTC },
            fiat: {
              value: priceRbtc * backersClaimedAmounts[gauge].RBTC,
              symbol: USD,
            },
          },
        },
        projectedReward: {
          RIF: {
            crypto: { value: projectedRifInHuman, symbol: RIF },
            fiat: {
              value: priceRif * projectedRifInHuman,
              symbol: USD,
            },
          },
          RBTC: {
            crypto: { value: projectedRbtcInHuman, symbol: RBTC },
            fiat: {
              value: priceRbtc * projectedRbtcInHuman,
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

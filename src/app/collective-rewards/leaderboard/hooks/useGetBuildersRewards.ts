import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { useGetRewardDistributedLogs } from '@/app/collective-rewards/hooks/useGetRewardDistributedLogs'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useGetTokenProjectedReward } from '@/app/collective-rewards/hooks/useGetTokenProjectedReward'
import { Address, isAddressEqual } from 'viem'
import { getLastCycleRewards } from '@/app/collective-rewards/utils/getLastCycleRewards'
import { useGetWhitelistedBuilders } from '@/app/collective-rewards/hooks/useGetWhitelistedBuilders'

export const useGetBuildersRewards = (rewardToken: Address, rewardTokenSymbol?: string, currency = 'USD') => {
  const {
    data: whitelistedBuilders,
    isLoading: whitelistedBuildersLoading,
    error: whitelistedBuildersError,
  } = useGetWhitelistedBuilders()

  const {
    data: rewardDistributedLogs,
    isLoading: logsLoading,
    error: logsError,
  } = useGetRewardDistributedLogs(rewardToken)

  const { prices } = usePricesContext()

  const {
    data: { share, projectedReward },
    isLoading: tokenLoading,
    error: tokenError,
  } = useGetTokenProjectedReward(rewardToken)
  const tokenSymbol = rewardTokenSymbol ?? ''

  const projectedRewardInHuman = Number(formatBalanceToHuman(projectedReward))

  const isLoading = whitelistedBuildersLoading || logsLoading || tokenLoading
  const error = whitelistedBuildersError ?? logsError ?? tokenError
  const builders = whitelistedBuilders ?? []

  return {
    data: builders.map(builder => {
      const builderEvents = rewardDistributedLogs.filter(event =>
        isAddressEqual(event.args.builder_, builder),
      )
      const lastCycleRewards = getLastCycleRewards(builderEvents)
      const lastCycleRewardsInHuman = Number(formatBalanceToHuman(lastCycleRewards))

      const price = prices[tokenSymbol]?.price ?? 0

      return {
        address: builder,
        lastCycleReward: {
          crypto: {
            value: lastCycleRewardsInHuman,
            symbol: tokenSymbol,
          },
          fiat: {
            value: price * lastCycleRewardsInHuman,
            symbol: currency,
          },
        },
        projectedReward: {
          crypto: {
            value: projectedRewardInHuman,
            symbol: tokenSymbol,
          },
          fiat: {
            value: price * projectedRewardInHuman,
            symbol: currency,
          },
        },
        share,
      }
    }),
    isLoading,
    error,
  }
}

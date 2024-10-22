import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { useGetRewardDistributedLogs } from '@/app/bim/hooks/useGetRewardDistributedLogs'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useGetTokenProjectedReward } from '@/app/bim/hooks/useGetTokenProjectedReward'
import { Address, isAddressEqual } from 'viem'
import { getLastCycleRewards } from '@/app/bim/utils/getLastCycleRewards'
import { useGetWhitelistedBuilders } from '@/app/bim/hooks/useGetWhitelistedBuilders'
import { getShare } from '@/app/bim/utils/getShare'

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

  const { data: token, isLoading: tokenLoading, error: tokenError } = useGetTokenProjectedReward(rewardToken)
  const tokenSymbol = rewardTokenSymbol ?? token.symbol ?? ''

  const projectedRewardInHuman = Number(formatBalanceToHuman(token.projectedReward))

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
        lastEpochReward: {
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
        share: `${getShare(token)}%`,
      }
    }),
    isLoading,
    error,
  }
}

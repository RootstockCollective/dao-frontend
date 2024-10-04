import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { useGetRewardDistributedLogs } from '@/app/bim/hooks/useGetRewardDistributedLogs'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useGetTokenProjectedReward } from '@/app/bim/hooks/useGetTokenProjectedReward'
import { Address, isAddressEqual } from 'viem'
import { getLastRewardValid } from '@/app/bim/utils/getLastRewardValid'
import { useGetWhitelistedBuilders } from '@/app/bim/hooks/useGetWhitelistedBuilders'

export const useGetBuildersRewards = (rewardToken: Address, currency = 'USD', currencySymbol = '$') => {
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
  const projectedRewardInHuman = Number(formatBalanceToHuman(token.projectedReward))

  const isLoading = whitelistedBuildersLoading || logsLoading || tokenLoading
  const error = whitelistedBuildersError ?? logsError ?? tokenError
  const builders = whitelistedBuilders ?? []

  return {
    data: builders.map(builder => {
      const builderEvents = rewardDistributedLogs.filter(event =>
        isAddressEqual(event.args.builder_, builder),
      )
      const lastReward = getLastRewardValid(builderEvents)
      const lastRewardInHuman = Number(formatBalanceToHuman(lastReward))

      const price = prices[token.symbol]?.price ?? 0

      return {
        address: builder,
        lastEpochReward: {
          onChain: {
            value: lastRewardInHuman,
            symbol: token.symbol,
          },
          fiat: {
            value: price * lastRewardInHuman,
            currency,
            symbol: currencySymbol,
          },
        },
        projectedReward: {
          onChain: {
            value: projectedRewardInHuman,
            symbol: token.symbol,
          },
          fiat: {
            value: price * projectedRewardInHuman,
            currency,
            symbol: currencySymbol,
          },
        },
        performance: !lastRewardInHuman ? 0 : projectedRewardInHuman / lastRewardInHuman,
      }
    }),
    isLoading,
    error,
  }
}

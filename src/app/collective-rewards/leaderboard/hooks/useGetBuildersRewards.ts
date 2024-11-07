import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useGetTokenProjectedReward, useGetRewardDistributedLogs } from '@/app/collective-rewards/rewards'
import { Address, isAddressEqual } from 'viem'
import { getLastCycleRewards } from '@/app/collective-rewards/utils/getLastCycleRewards'
import { useBuilderContext } from '@/app/collective-rewards/builders'

export const useGetBuildersRewards = (rewardToken: Address, rewardTokenSymbol?: string, currency = 'USD') => {
  const { data: builders, isLoading: buildersLoading, error: buildersError } = useBuilderContext()

  const {
    data: rewardDistributedLogs,
    isLoading: logsLoading,
    error: logsError,
  } = useGetRewardDistributedLogs(rewardToken)
  const {
    data: { share, projectedReward },
    isLoading: tokenLoading,
    error: tokenError,
  } = useGetTokenProjectedReward(rewardToken)
  const tokenSymbol = rewardTokenSymbol ?? ''

  const projectedRewardInHuman = Number(formatBalanceToHuman(projectedReward))

  const isLoading = buildersLoading || logsLoading || tokenLoading
  const error = buildersError ?? logsError ?? tokenError
  const whitelistedBuilders = builders.filter(builder => builder.status === 'Whitelisted')

  const { prices } = usePricesContext()

  return {
    data: whitelistedBuilders.map(({ address, builderName }) => {
      const builderEvents = rewardDistributedLogs.filter(event =>
        isAddressEqual(event.args.builder_, address),
      )
      const lastCycleRewards = getLastCycleRewards(builderEvents)
      const lastCycleRewardsInHuman = Number(formatBalanceToHuman(lastCycleRewards))

      const price = prices[tokenSymbol]?.price ?? 0

      return {
        address,
        builderName,
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

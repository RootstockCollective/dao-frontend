import Big from 'big.js'
import { useMemo } from 'react'
import { isAddressEqual } from 'viem'

import {
  NotifyRewardEvent,
  useGetGaugesNotifyReward,
  UseGetGaugesNotifyRewardReturnType,
} from '@/app/collective-rewards/rewards'
import { useGetGaugesArray } from '@/app/collective-rewards/user'
import { MetricToken } from '@/app/components/Metric/types'
import { createMetricToken } from '@/app/components/Metric/utils'
import { GetPricesResult } from '@/app/user/types'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'

export const useGetTotalRewardsFromEvents = () => {
  const { prices } = usePricesContext()

  const { data: gauges, isLoading: isLoadingGauges, error: errorGauges } = useGetGaugesArray()
  const {
    data: rewardsData,
    isLoading: isLoadingRewards,
    error: errorRewards,
  } = useGetGaugesNotifyReward({
    gauges,
    rewardTokens: REWARD_TOKEN_KEYS.map(tokenKey => TOKENS[tokenKey].address),
  })

  const isLoading = isLoadingGauges || isLoadingRewards
  const error = errorGauges ?? errorRewards ?? null

  const data = useMemo(() => aggregateRewardEvents(rewardsData, prices), [rewardsData, prices])

  return { data, isLoading, error }
}

function aggregateRewardEvents(
  rewardsData: UseGetGaugesNotifyRewardReturnType,
  prices: GetPricesResult,
): { rewardPerToken: MetricToken[]; combinedRewardsFiat: Big } {
  const allRewardEvents = Object.values(rewardsData).map<NotifyRewardEvent[]>(events => events)

  return REWARD_TOKEN_KEYS.reduce<{ rewardPerToken: MetricToken[]; combinedRewardsFiat: Big }>(
    (acc, tokenKey) => {
      const { address: tokenAddress, symbol } = TOKENS[tokenKey]
      const price = prices[symbol]?.price ?? 0
      const value = allRewardEvents.reduce(
        (totalTokenReward, events) =>
          totalTokenReward +
          events.reduce(
            (combinedEventsReward, { args }) =>
              isAddressEqual(args.rewardToken_, tokenAddress)
                ? combinedEventsReward + args.backersAmount_ + args.builderAmount_
                : combinedEventsReward,
            0n,
          ),
        0n,
      )

      const metricToken = createMetricToken({ symbol, value, price })
      acc.rewardPerToken.push(metricToken)
      acc.combinedRewardsFiat = acc.combinedRewardsFiat.add(Big(metricToken.fiatValue))
      return acc
    },
    { rewardPerToken: [], combinedRewardsFiat: Big(0) },
  )
}

import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'
import { useGetCycleRewards } from '@/app/collective-rewards/shared/hooks/useGetCycleRewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { FiatTooltipLabel } from '@/app/components'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { MetricToken } from '@/app/components/Metric/types'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric } from '@/components/Metric'
import { Header } from '@/components/Typography'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context/PricesContext'
import Big from 'big.js'
import { createMetricToken } from '@/app/components/Metric/utils'

export const EstimatedRewards = () => {
  const {
    data: cycleRewards,
    isLoading: cycleRewardsLoading,
    error: cycleRewardsError,
  } = useGetCycleRewards()

  const { prices } = usePricesContext()

  useHandleErrors({ error: cycleRewardsError, title: 'Error loading cycle rewards' })

  if (cycleRewardsLoading) {
    return <LoadingSpinner />
  }

  const { rewardPerToken, combinedRewardsFiat } = REWARD_TOKEN_KEYS.reduce(
    (acc, tokenKey) => {
      const { symbol } = TOKENS[tokenKey]
      const amount = cycleRewards[tokenKey] ?? 0n
      const price = prices[symbol]?.price || 0

      const metricToken = createMetricToken({
        symbol,
        value: amount,
        price,
      })

      acc.combinedRewardsFiat = acc.combinedRewardsFiat.add(Big(metricToken.fiatValue))
      acc.rewardPerToken.push(metricToken)

      return acc
    },
    {
      rewardPerToken: [] as MetricToken[],
      combinedRewardsFiat: Big(0),
    },
  )

  return (
    <Metric
      title="Estimated Rewards"
      className="w-full md:w-auto"
      containerClassName="gap-1 md:gap-4"
      contentClassName="flex flex-col gap-2"
    >
      <Header
        variant="h2"
        className="text-v3-text-100 overflow-hidden text-ellipsis leading-[125%] tracking-[0.03rem] text-xl"
      >
        {formatCurrency(combinedRewardsFiat, { showCurrencySymbol: false })}{' '}
        <FiatTooltipLabel tooltip={{ side: 'top', text: <MetricTooltipContent tokens={rewardPerToken} /> }} />
      </Header>
      <MetricBar segments={rewardPerToken} />
    </Metric>
  )
}

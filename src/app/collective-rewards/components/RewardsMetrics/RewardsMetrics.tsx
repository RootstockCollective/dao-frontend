import { FiatTooltipLabel } from '@/app/components'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { MetricToken } from '@/app/components/Metric/types'
import { createMetricToken } from '@/app/components/Metric/utils'
import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'
import { Metric } from '@/components/Metric'
import { Header, Label } from '@/components/Typography'
import { REWARD_TOKENS } from '@/lib/tokens'
import { formatCurrency, formatCurrencyWithLabel } from '@/lib/utils'
import { usePricesContext } from '@/shared/context/PricesContext'
import Big from 'big.js'
import { FC } from 'react'

export type TokenWithValue = (typeof REWARD_TOKENS)[number] & {
  value: bigint
}

export interface RewardsMetricsProps {
  title: string
  rewardTokens: TokenWithValue[]
}

export const RewardsMetrics: FC<RewardsMetricsProps> = ({ title, rewardTokens }) => {
  const { prices } = usePricesContext()

  const {
    rewardMetricPerToken,
    totalEstimatedRewards,
  }: {
    rewardMetricPerToken: MetricToken[]
    totalEstimatedRewards: Big
  } = rewardTokens.reduce(
    (acc, { symbol, value }) => {
      const tokenPrice = prices[symbol]?.price || 0
      const metricToken = createMetricToken({
        symbol,
        value,
        price: tokenPrice,
      })

      acc.rewardMetricPerToken.push(metricToken)
      acc.totalEstimatedRewards = acc.totalEstimatedRewards.add(Big(metricToken.fiatValue))

      return acc
    },
    { rewardMetricPerToken: [] as MetricToken[], totalEstimatedRewards: Big(0) },
  )

  return (
    <Metric className="text-v3-text-0" title={<Label className="text-v3-bg-accent-60">{title}</Label>}>
      <div className="flex flex-row items-baseline gap-2 font-rootstock-sans">
        <Header>{formatCurrency(totalEstimatedRewards)}</Header>
        <FiatTooltipLabel
          tooltip={{ side: 'top', text: <MetricTooltipContent tokens={rewardMetricPerToken} /> }}
        />
      </div>
    </Metric>
  )
}

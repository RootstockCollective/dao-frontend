import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { FiatTooltipLabel } from '@/app/components/Tooltip/FiatTooltipLabel/FiatTooltipLabel'
import { useGetBuilderLastCycleRewards } from '@/app/my-rewards/builder/hooks/useGetBuilderLastCycleRewards'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { Header } from '@/components/Typography'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { Address } from 'viem'
import { getMetricTokens } from '@/app/shared/utils'
import { useMemo } from 'react'

export const LastCycleRewards = ({ gauge }: { gauge: Address }) => {
  const {
    isLoading,
    error: _error,
    ...tokens
  } = useGetBuilderLastCycleRewards({
    gauge,
  })
  const { prices } = usePricesContext()

  const { metricTokens, total } = useMemo(() => getMetricTokens(tokens, prices), [tokens, prices])

  return (
    <RewardCard
      data-testid="last-cycle-rewards"
      isLoading={isLoading}
      title="Last cycle"
      info="Your rewards from the previous cycle"
      className="flex-col justify-between w-full"
    >
      <div className="flex items-center gap-2">
        <Header variant="h3">
          {formatCurrency(total, { showCurrencySymbol: false })}{' '}
          <FiatTooltipLabel tooltip={{ side: 'top', text: <MetricTooltipContent tokens={metricTokens} /> }} />
        </Header>
      </div>
      <MetricBar segments={metricTokens} className="w-full md:max-w-[180px]" />
    </RewardCard>
  )
}

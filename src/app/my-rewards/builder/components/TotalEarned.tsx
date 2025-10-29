import { useHandleErrors } from '@/app/collective-rewards/utils'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { FiatTooltipLabel } from '@/app/components/Tooltip/FiatTooltipLabel/FiatTooltipLabel'
import { useGetBuilderAllTimeRewards } from '@/app/my-rewards/builder/hooks/useGetBuilderAllTimeRewards'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { getMetricTokens } from '@/app/shared/utils'
import { Header } from '@/components/Typography'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { useMemo } from 'react'
import { Address } from 'viem'

export const TotalEarned = ({ gauge }: { gauge: Address }) => {
  const { isLoading, error, ...tokens } = useGetBuilderAllTimeRewards({
    gauge,
  })
  const { prices } = usePricesContext()
  useHandleErrors({ error, title: 'Error loading total earned' })

  const { metricTokens, total } = useMemo(() => getMetricTokens(tokens, prices), [tokens, prices])

  return (
    <RewardCard
      data-testid="total-earned"
      isLoading={isLoading}
      title="Total earned"
      info="Your total rewards earned across all cycles"
      className="flex-row sm:flex-col justify-between w-full"
    >
      <div className="flex items-center gap-2">
        <Header variant="h3">
          {formatCurrency(total, { showCurrencySymbol: false })}{' '}
          <FiatTooltipLabel tooltip={{ side: 'top', text: <MetricTooltipContent tokens={metricTokens} /> }} />
        </Header>
      </div>
      <MetricBar segments={metricTokens} className="w-full max-w-[180px]" />
    </RewardCard>
  )
}

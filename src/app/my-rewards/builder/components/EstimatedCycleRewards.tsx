import { useHandleErrors } from '@/app/collective-rewards/utils'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { FiatTooltipLabel } from '@/app/components/Tooltip/FiatTooltipLabel/FiatTooltipLabel'
import { useGetBuilderEstimatedRewards } from '@/app/my-rewards/builder/hooks/useGetBuilderEstimatedRewards'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { Header } from '@/components/Typography'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { Address } from 'viem'
import { getMetricTokens } from '@/app/shared/utils'
import { useMemo } from 'react'

export const EstimatedCycleRewards = ({ builder, gauge }: { builder: Address; gauge: Address }) => {
  const { isLoading, error, ...tokens } = useGetBuilderEstimatedRewards({
    builder: builder,
    gauge,
  })
  const { prices } = usePricesContext()
  useHandleErrors({ error, title: 'Error loading estimated rewards' })

  const { metricTokens, total } = useMemo(() => getMetricTokens(tokens, prices), [tokens, prices])

  return (
    <RewardCard
      data-testid="estimated-cycle-rewards"
      isLoading={isLoading}
      title="Estimated this cycle"
      info="Your estimated rewards which will become claimable at the start of the next Cycle."
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

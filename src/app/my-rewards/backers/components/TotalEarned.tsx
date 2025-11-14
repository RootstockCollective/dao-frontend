import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { FiatTooltipLabel } from '@/app/components/Tooltip/FiatTooltipLabel/FiatTooltipLabel'
import { Header } from '@/components/Typography'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { useMemo } from 'react'
import { getMetricTokens } from '@/app/shared/utils'
import { useBackerTotalEarned } from '../hooks/useBackerTotalEarned'

export const TotalEarned = () => {
  const tokens = useBackerTotalEarned()
  const { prices } = usePricesContext()
  useHandleErrors({
    error: tokens.rif.error ?? tokens.rbtc.error ?? tokens.usdrif.error,
    title: 'Error loading backer total earned',
  })

  const { metricTokens, total } = useMemo(
    () =>
      getMetricTokens(
        {
          rif: tokens.rif.amount,
          rbtc: tokens.rbtc.amount,
          usdrif: tokens.usdrif.amount,
        },
        prices,
      ),
    [tokens, prices],
  )

  return (
    <RewardCard
      isLoading={tokens.rif.isLoading || tokens.rbtc.isLoading || tokens.usdrif.isLoading}
      title="Total earned"
      info="Total of your received and claimable rewards"
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

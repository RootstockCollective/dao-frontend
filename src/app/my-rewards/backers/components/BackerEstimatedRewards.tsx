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
import { useBackerEstimatedRewards } from '../hooks/useBackerEstimatedRewards'

export const BackerEstimatedRewards = () => {
  const tokens = useBackerEstimatedRewards()
  const { prices } = usePricesContext()
  useHandleErrors({
    error: tokens.rif.error ?? tokens.rbtc.error ?? tokens.usdrif.error,
    title: 'Error loading backer estimated rewards',
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
      title="Estimated this cycle"
      info={
        <span className="flex flex-col gap-2 text-wrap max-w-[35rem]">
          <span>
            An estimate of the remainder of this Cycle&apos;s rewards that will become fully claimable by the
            end of the current Cycle. These rewards gradually transition into your &apos;Claimable
            Rewards&apos; as the cycle progresses.
          </span>
          <span className="mt-2 mb-2">
            To check the cycle&apos;s completion, go to Collective Rewards → Current Cycle.
          </span>
          <span>
            The displayed information is dynamic and may vary based on total rewards and user activity. This
            data is for informational purposes only.
          </span>
        </span>
      }
      className="flex flex-col justify-between w-full"
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

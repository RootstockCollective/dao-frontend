import { getFiatAmount, useHandleErrors } from '@/app/collective-rewards/utils'
import { FiatTooltipLabel } from '@/app/components'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { MetricToken } from '@/app/components/Metric/types'
import { createMetricToken } from '@/app/components/Metric/utils'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { LoadingSpinner } from '@/components/LoadingSpinner/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { Header, Paragraph } from '@/components/Typography'
import Big from '@/lib/big'
import { REWARD_TOKEN_KEYS, RewardTokenKey, TOKENS } from '@/lib/tokens'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { useMemo } from 'react'

export const EstimatedRewardsMetric = () => {
  const { prices } = usePricesContext()
  const { data: estimatedRewards, isLoading, error } = useGetBuilderEstimatedRewards()
  useHandleErrors({ error, title: 'Error fetching estimated rewards' })

  const { fiatTotal, ...tokens } = useMemo(
    () =>
      estimatedRewards.reduce<
        Record<RewardTokenKey, bigint> & {
          fiatTotal: Big
        }
      >(
        (acc: { rif: bigint; rbtc: bigint; usdrif: bigint; fiatTotal: Big }, builder) => {
          return {
            rif: acc.rif + builder.backerEstimatedRewards.rif.amount.value,
            rbtc: acc.rbtc + builder.backerEstimatedRewards.rbtc.amount.value,
            usdrif: acc.usdrif + builder.backerEstimatedRewards.usdrif.amount.value,
            fiatTotal: acc.fiatTotal
              .add(getFiatAmount(builder.backerEstimatedRewards.rif.amount))
              .add(getFiatAmount(builder.backerEstimatedRewards.rbtc.amount))
              .add(getFiatAmount(builder.backerEstimatedRewards.usdrif.amount)),
          }
        },
        { fiatTotal: Big(0), rif: 0n, rbtc: 0n, usdrif: 0n },
      ),
    [estimatedRewards],
  )

  const metricTokens = useMemo(
    () =>
      REWARD_TOKEN_KEYS.map<MetricToken>(tokenKey => {
        const { symbol } = TOKENS[tokenKey]
        const value = tokens[tokenKey]
        const price = prices[symbol]?.price ?? 0

        return createMetricToken({ symbol, value, price })
      }),
    [tokens, prices],
  )

  return (
    <Metric
      title={
        <MetricTitle
          title="Estimated Rewards"
          infoIconProps={{
            tooltipClassName: 'max-w-sm text-sm',
          }}
          info={
            <Paragraph className="text-[14px] font-normal text-left">
              The estimated rewards Backers will receive in the next Cycle.
              <br />
              <br />
              The displayed information is dynamic and may vary based on total rewards and user activity. This
              data is for informational purposes only.
            </Paragraph>
          }
        />
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-row items-baseline gap-2 font-rootstock-sans">
          <Header variant="h1">{formatCurrency(fiatTotal)}</Header>
          <FiatTooltipLabel tooltip={{ side: 'top', text: <MetricTooltipContent tokens={metricTokens} /> }} />
        </div>
      )}
    </Metric>
  )
}

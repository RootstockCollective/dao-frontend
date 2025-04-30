import { createElement } from 'react'
import { MetricsCard, MetricsCardTitle, TokenMetricsCardRow } from '@/app/collective-rewards/rewards'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { ABIFormula, useGetMetricsAbi } from '@/app/collective-rewards/shared'
import { useHandleErrors } from '@/app/collective-rewards/utils'

export const ABIMetrics = () => {
  const { data: abiPct, isLoading, error } = useGetMetricsAbi()
  useHandleErrors({ error, title: 'Error loading ABI metrics' })

  return (
    <>
      <MetricsCard borderless>
        <MetricsCardTitle
          className="text-wrap"
          title="Annual Backers Incentives %"
          data-testid="abiPct"
          tooltip={{
            text: (
              <span className="font-rootstock-sans text-sm font-normal">
                The Annual Backers Incentives (%) represents an estimate of the annualized percentage of
                rewards that backers could receive based on their backing allocations.
                <br />
                <br />
                The calculation follows the formula:
                <span className="flex justify-center">
                  <ABIFormula />
                </span>
                <br />
                <br />
                This estimation is dynamic and may vary based on total rewards and user activity. This data is
                for informational purposes only.
              </span>
            ),
            popoverProps: {
              size: 'medium',
              position: 'left-bottom',
            },
          }}
        />
        <>
          {
            (withSpinner(TokenMetricsCardRow, { className: 'min-h-0 grow-0', size: 'small' }),
            {
              amount: `${abiPct?.toFixed(0)}%`,
              isLoading,
            })
          }
        </>
      </MetricsCard>
    </>
  )
}

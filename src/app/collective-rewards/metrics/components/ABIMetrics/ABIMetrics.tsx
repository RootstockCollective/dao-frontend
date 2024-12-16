import { MetricsCard, MetricsCardTitle, TokenMetricsCardRow } from '@/app/collective-rewards/rewards'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { useGetABI } from './hooks/useGetABI'

export const ABIMetrics = () => {
  const { data: abiPct, isLoading } = useGetABI()
  return (
    <>
      <MetricsCard borderless>
        <MetricsCardTitle
          title="Annual Backers Incentives %"
          data-testid="abiPct"
          tooltip={{
            text: (
              <span className="font-rootstock-sans text-sm font-normal">
                The Annual Backers Incentives (%) represents an estimate of the annualized percentage of
                rewards that backers could receive based on their backing allocations.
                <br />
                <br />
                The calculation follows the formula: (1 + Rewards per stRIF per Cycle / RIF price)^26 - 1.
                <br />
                <br />
                This estimation is dynamic and may vary based on total rewards and user activity. This data is
                for informational purposes only.{' '}
              </span>
            ),
            popoverProps: {
              size: 'medium',
              position: 'left-bottom',
            },
          }}
        />
        {withSpinner(
          TokenMetricsCardRow,
          'min-h-0 grow-0',
        )({
          amount: `${abiPct.toFixed(0)}%`,
          isLoading,
        })}
      </MetricsCard>
    </>
  )
}

import { useGetGaugesLength } from '@/app/collective-rewards/user'
import { MetricsCard, MetricsCardTitle, TokenMetricsCardRow } from '@/app/collective-rewards/rewards'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { useHandleErrors } from '@/app/collective-rewards/utils'

export const TotalActiveBuildersMetrics = () => {
  const { data, isLoading, error } = useGetGaugesLength('active')
  useHandleErrors({ error, title: 'Error loading active builders' })

  return (
    <MetricsCard borderless>
      <MetricsCardTitle title="Total active builders" data-testid="TotalActiveBuilders" />
      {withSpinner(
        TokenMetricsCardRow,
        'min-h-0 grow-0',
      )({
        amount: Number(data || 0n).toFixed(),
        isLoading,
      })}
    </MetricsCard>
  )
}

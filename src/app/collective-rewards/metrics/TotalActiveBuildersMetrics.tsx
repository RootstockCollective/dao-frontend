import { useGetBuildersByState } from '@/app/collective-rewards/user'
import { MetricsCard, MetricsCardTitle, TokenMetricsCardRow } from '@/app/collective-rewards/rewards'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { useHandleErrors } from '@/app/collective-rewards/utils'

export const TotalActiveBuildersMetrics = () => {
  const {
    data: activatedBuilders,
    isLoading,
    error,
  } = useGetBuildersByState({
    initialized: true,
    communityApproved: true,
    kycApproved: true,
    kycPaused: false,
  })
  useHandleErrors({ error, title: 'Error loading active builders' })

  return (
    <MetricsCard borderless>
      <MetricsCardTitle title="Total active builders" data-testid="TotalActiveBuilders" />
      {withSpinner(TokenMetricsCardRow, { className: 'min-h-0 grow-0', size: 'small' })({
        amount: activatedBuilders.length.toString(),
        isLoading,
      })}
    </MetricsCard>
  )
}

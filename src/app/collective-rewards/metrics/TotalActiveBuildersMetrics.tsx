import { filterBuildersByState, useBuilderContext } from '@/app/collective-rewards/user'
import { MetricsCard, MetricsCardTitle, TokenMetricsCardRow } from '@/app/collective-rewards/rewards'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { CompleteBuilder } from '../types'

export const TotalActiveBuildersMetrics = () => {
  const { builders, isLoading, error } = useBuilderContext()
  const activeBuilders = filterBuildersByState<CompleteBuilder>(builders)
  useHandleErrors({ error, title: 'Error loading active builders' })

  return (
    <MetricsCard borderless>
      <MetricsCardTitle title="Total active builders" data-testid="TotalActiveBuilders" />
      <>
        {withSpinner(TokenMetricsCardRow, { className: 'min-h-0 grow-0', size: 'small' })({
          amount: activeBuilders.length.toString(),
          isLoading,
        })}
      </>
    </MetricsCard>
  )
}

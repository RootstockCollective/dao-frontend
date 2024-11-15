import { MetricsCardWithSpinner } from '@/components/MetricsCard/MetricsCard'
import { useGetGaugesLength } from '../user'
import { useHandleErrors } from '@/app/collective-rewards/utils'

export const TotalActiveBuildersMetrics = () => {
  const { data, isLoading, error } = useGetGaugesLength('active')
  useHandleErrors({ error, title: 'Error loading active builders' })

  return (
    <MetricsCardWithSpinner
      title="Total active builders"
      amount={Number(data || 0n).toFixed()}
      isLoading={isLoading}
      borderless
    />
  )
}

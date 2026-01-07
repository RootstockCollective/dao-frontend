import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Metric } from '@/components/Metric'
import { useGetActiveBuildersCount } from '@/app/collective-rewards/shared/hooks/useGetActiveBuildersCount'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header } from '@/components/Typography'

export const ActiveBuilders = () => {
  const { data, isLoading, error } = useGetActiveBuildersCount()
  useHandleErrors({ error, title: 'Error loading active builders' })
  if (isLoading) return <LoadingSpinner size="medium" />
  return (
    <Metric title="Total active Builders">
      <Header variant="h3" bold>
        {data?.count ?? 0}
      </Header>
    </Metric>
  )
}

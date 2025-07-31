import { useGetActiveBuildersCount } from '@/app/hooks/useGetActiveBuildersCount'
import { useHandleErrors } from '@/app/utils'
import { Metric } from '@/components/Metric'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export const ActiveBuilders = () => {
  const { data, isLoading, error } = useGetActiveBuildersCount()
  useHandleErrors({ error, title: 'Error loading active builders' })
  if (isLoading) return <LoadingSpinner size="medium" />
  return (
    <Metric title="Total active Builders">
      <div className="text-3xl font-bold text-white">{data?.count ?? 0}</div>
    </Metric>
  )
}

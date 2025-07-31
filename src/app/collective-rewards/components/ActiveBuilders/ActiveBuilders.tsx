import { useGetActiveBuildersCount } from '@/app/hooks/useGetActiveBuildersCount'
import { CountMetric } from '@/app/collective-rewards/components/CountMetric'
import { useHandleErrors } from '@/app/utils'

export const ActiveBuilders = () => {
  const { data, isLoading, error } = useGetActiveBuildersCount()

  useHandleErrors({ error, title: 'Error loading active builders' })

  return (
    <CountMetric title="Active Builders" isLoading={isLoading}>
      {data?.count ?? 0}
    </CountMetric>
  )
}

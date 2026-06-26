import { useRouter } from 'next/navigation'

import { CountMetric } from '@/app/collective-rewards/components/CountMetric'
import { useGetActiveBuildersCount } from '@/app/collective-rewards/shared/hooks/useGetActiveBuildersCount'
import { useHandleErrors } from '@/app/collective-rewards/utils'

export const ActiveBuilders = () => {
  const router = useRouter()
  const { data, isLoading, error } = useGetActiveBuildersCount()

  useHandleErrors({ error, title: 'Error loading active builders' })

  const count = data?.count ?? 0
  const onClick = count > 0 ? () => router.push('/builders#builders-table') : undefined

  return (
    <CountMetric title="Active Builders" isLoading={isLoading} onClick={onClick}>
      {count}
    </CountMetric>
  )
}

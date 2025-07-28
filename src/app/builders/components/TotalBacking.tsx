import { useGetTotalAllocation } from '@/app/collective-rewards/metrics/hooks/useGetTotalAllocation'
import { useGetGaugesArray } from '@/app/collective-rewards/user/hooks/useGetGaugesArray'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { formatSymbol } from '@/app/collective-rewards/rewards'
import { Metric } from '@/components/Metric'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export const TotalBacking = () => {
  const { data: allGauges } = useGetGaugesArray()
  const gauges = allGauges ?? []
  const { data: totalAllocations, isLoading, error } = useGetTotalAllocation(gauges)

  useHandleErrors({ error, title: 'Error loading total allocations' })

  if (isLoading) return <LoadingSpinner size="medium" />

  return (
    <Metric title="Total backing">
      <div className="text-3xl font-bold text-white">{formatSymbol(totalAllocations, 'StRIF')}</div>
    </Metric>
  )
}

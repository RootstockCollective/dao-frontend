import { Metric } from '@/components/Metric'
import { formatSymbol } from '../../rewards/utils'
import { RIFToken } from '@/app/backing/components/RIFToken/RIFToken'
import { useGetTotalAllocation } from '../../metrics/hooks/useGetTotalAllocation'
import { useGetGaugesArray } from '../../user/hooks/useGetGaugesArray'
import { useHandleErrors } from '../../utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export const TotalBackingLoader = () => {
  const { data: allGauges } = useGetGaugesArray()
  const gauges = allGauges ?? []
  const { data: totalAllocations, isLoading, error } = useGetTotalAllocation(gauges)

  useHandleErrors({ error, title: 'Error loading total allocations' })

  if (isLoading) {
    return <LoadingSpinner />
  }

  return <TotalBackingContent totalAllocations={totalAllocations} />
}

export const TotalBackingContent = ({ totalAllocations }: { totalAllocations: bigint }) => {
  return (
    <Metric title="Total backing">
      {' '}
      {formatSymbol(totalAllocations, 'StRIF')} <RIFToken />{' '}
    </Metric>
  )
}

export const TotalBacking = TotalBackingLoader

import { useGetTotalAllocation } from '@/app/collective-rewards/metrics/hooks/useGetTotalAllocation'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils'
import { useGetGaugesArray } from '@/app/collective-rewards/user/hooks/useGetGaugesArray'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Metric } from '@/components/Metric'
import { TokenImage, TokenSymbol } from '@/components/TokenImage'
import { Paragraph, Span } from '@/components/TypographyNew'

export const TotalBackingLoader = () => {
  const { data: allGauges } = useGetGaugesArray()
  const gauges = allGauges ?? []
  const { data: totalAllocations, isLoading, error } = useGetTotalAllocation(gauges)

  useHandleErrors({ error, title: 'Error loading total allocations' })

  return <TotalBackingContentWithSpinner isLoading={isLoading} totalAllocations={totalAllocations} />
}

export const TotalBackingContent = ({ totalAllocations }: { totalAllocations: bigint }) => {
  return (
    <Metric title="Total Backing" className="w-auto pr-12" containerClassName="gap-4">
      <div className="flex items-center gap-2 font-kk-topo text-lg font-normal tracking-tight">
        <Paragraph className="font-bold">{formatSymbol(totalAllocations, 'StRIF')}</Paragraph>
        <TokenImage symbol={TokenSymbol.STRIF} size={16} />
        <Span>{TokenSymbol.STRIF}</Span>
      </div>
    </Metric>
  )
}

export const TotalBackingContentWithSpinner = withSpinner(TotalBackingContent)

export const TotalBacking = TotalBackingLoader

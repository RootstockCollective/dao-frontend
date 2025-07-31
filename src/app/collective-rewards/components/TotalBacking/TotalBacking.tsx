import { useGetTotalAllocation } from '@/app/hooks/useGetTotalAllocation'
import { useHandleErrors, formatSymbol } from '@/app/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Metric } from '@/components/Metric'
import { TokenImage, TokenSymbol } from '@/components/TokenImage'
import { Paragraph, Span } from '@/components/TypographyNew'
import { Address } from 'viem'
import { useBuilderContext } from '../../../context/builder/BuilderContext'

export const TotalBackingLoader = () => {
  const { builders, isLoading: isLoadingBuilders, error: errorBuilders } = useBuilderContext()
  const gauges = builders.map(b => b.gauge).filter(Boolean) as Address[]
  const {
    data: totalAllocations,
    isLoading: isLoadingTotalAllocations,
    error: errorTotalAllocations,
  } = useGetTotalAllocation(gauges)

  useHandleErrors({ error: errorBuilders ?? errorTotalAllocations, title: 'Error loading total allocations' })

  return (
    <TotalBackingContentWithSpinner
      isLoading={isLoadingBuilders || isLoadingTotalAllocations}
      totalAllocations={totalAllocations}
    />
  )
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

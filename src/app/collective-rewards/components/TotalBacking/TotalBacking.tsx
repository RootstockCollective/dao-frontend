import { useGetTotalAllocation } from '@/app/collective-rewards/metrics/hooks/useGetTotalAllocation'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Metric } from '@/components/Metric'
import { TokenImage } from '@/components/TokenImage'
import { Paragraph, Span } from '@/components/Typography'
import { STRIF } from '@/lib/tokens'
import { Address } from 'viem'
import { useBuilderContext } from '../../user/context/BuilderContext'

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
    <Metric title="Total Backing" className="w-auto" containerClassName="gap-[0.125rem] md:gap-4">
      <div className="flex items-center gap-2 font-kk-topo text-xl font-normal tracking-tight">
        <Paragraph className="text-xl">{formatSymbol(totalAllocations, 'StRIF')}</Paragraph>
        <div className="flex items-center gap-[0.1875rem]">
          <TokenImage symbol={STRIF} size={16} />
          <Span className="text-sm">{STRIF}</Span>
        </div>
      </div>
    </Metric>
  )
}

const TotalBackingContentWithSpinner = withSpinner(TotalBackingContent)

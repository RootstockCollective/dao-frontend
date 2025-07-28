import { useGetTotalAllocation } from '@/app/collective-rewards/metrics/hooks/useGetTotalAllocation'
import { formatSymbol } from '@/app/collective-rewards/rewards'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { TokenImage, TokenSymbol } from '@/components/TokenImage'
import { Paragraph } from '@/components/TypographyNew/Paragraph'
import { Span } from '@/components/TypographyNew/Span'
import { Address } from 'viem'

export const TotalBacking = () => {
  const { builders, isLoading: isLoadingBuilders, error: errorBuilders } = useBuilderContext()
  const gauges = builders.map(b => b.gauge).filter(Boolean) as Address[]
  const {
    data: totalAllocations,
    isLoading: isLoadingTotalAllocations,
    error: errorTotalAllocations,
  } = useGetTotalAllocation(gauges)

  useHandleErrors({ error: errorBuilders ?? errorTotalAllocations, title: 'Error loading total allocations' })

  if (isLoadingBuilders || isLoadingTotalAllocations) return <LoadingSpinner size="medium" />

  return (
    <Metric
      title={
        <MetricTitle
          title="Total backing"
          info={
            <Paragraph className="text-[14px] font-normal text-left">
              The total amount of stRIF allocated to Builders.
            </Paragraph>
          }
        />
      }
    >
      <div className="flex items-center gap-2 font-kk-topo text-3xl font-normal tracking-tight">
        <div className="font-bold text-white">{formatSymbol(totalAllocations, 'StRIF')}</div>
        <div className="flex items-center gap-1">
          <TokenImage symbol={TokenSymbol.STRIF} size={24} />
          <Span className="text-xl">{TokenSymbol.STRIF}</Span>
        </div>
      </div>
    </Metric>
  )
}

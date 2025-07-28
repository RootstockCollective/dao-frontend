import { useGetTotalAllocation } from '@/app/collective-rewards/metrics/hooks/useGetTotalAllocation'
import { formatSymbol } from '@/app/collective-rewards/rewards'
import { useGetGaugesArray } from '@/app/collective-rewards/user/hooks/useGetGaugesArray'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { TokenImage, TokenSymbol } from '@/components/TokenImage'
import { Paragraph } from '@/components/TypographyNew/Paragraph'
import { Span } from '@/components/TypographyNew/Span'

export const TotalBacking = () => {
  const { data: allGauges } = useGetGaugesArray()
  const gauges = allGauges ?? []
  const { data: totalAllocations, isLoading, error } = useGetTotalAllocation(gauges)

  useHandleErrors({ error, title: 'Error loading total allocations' })

  if (isLoading) return <LoadingSpinner size="medium" />

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

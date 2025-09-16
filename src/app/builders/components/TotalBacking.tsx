import { useGetTotalAllocation } from '@/app/collective-rewards/metrics/hooks/useGetTotalAllocation'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { TokenImage, TokenSymbol } from '@/components/TokenImage'
import { Header } from '@/components/Typography'
import { Paragraph } from '@/components/Typography/Paragraph'
import { Span } from '@/components/Typography/Span'
import { Address } from 'viem'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { usePricesContext } from '@/shared/context/PricesContext'
import { formatCurrencyWithLabel } from '@/lib/utils'
import { RIF } from '@/lib/constants'

export const TotalBacking = () => {
  const { builders, isLoading: isLoadingBuilders, error: errorBuilders } = useBuilderContext()
  const gauges = builders.map(b => b.gauge).filter(Boolean) as Address[]
  const {
    data: totalAllocations,
    isLoading: isLoadingTotalAllocations,
    error: errorTotalAllocations,
  } = useGetTotalAllocation(gauges)
  const { prices } = usePricesContext()

  useHandleErrors({ error: errorBuilders ?? errorTotalAllocations, title: 'Error loading total allocations' })
  const isDesktop = useIsDesktop()

  // Calculate USD value from totalAllocations using existing utility
  const rifPrice = prices[RIF]?.price ?? 0
  const totalAllocationsInUsd = getFiatAmount(totalAllocations, rifPrice)

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
      <div className="flex flex-col">
        <div className="flex items-center gap-2 font-kk-topo text-3xl font-normal tracking-tight">
          <Header variant={isDesktop ? 'h1' : 'h3'}>{formatSymbol(totalAllocations, 'StRIF')}</Header>
          <div className="flex items-center gap-1">
            <TokenImage symbol={TokenSymbol.STRIF} size={isDesktop ? 24 : 16} />
            <Span className="text-sm md:text-lg">{TokenSymbol.STRIF}</Span>
          </div>
        </div>
        <Span variant="body-s" className="text-bg-0">
          {formatCurrencyWithLabel(totalAllocationsInUsd)}
        </Span>
      </div>
    </Metric>
  )
}

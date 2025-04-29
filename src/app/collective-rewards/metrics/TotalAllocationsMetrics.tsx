import { Address } from 'viem'
import { FC } from 'react'
import { usePricesContext } from '@/shared/context/PricesContext'
import {
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
  Token,
  formatMetrics,
} from '@/app/collective-rewards/rewards'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useGetTotalAllocation } from './hooks/useGetTotalAllocation'

type TotalAllocationsProps = {
  gauges: Address[]
  currency?: string
  token: Token
}

export const TotalAllocationsMetrics: FC<TotalAllocationsProps> = ({
  gauges,
  token: { symbol },
  currency = 'USD',
}) => {
  const { prices } = usePricesContext()
  const { data: totalAllocations, isLoading, error } = useGetTotalAllocation(gauges)
  useHandleErrors({ error, title: 'Error loading total allocations' })

  const price = prices[symbol]?.price ?? 0
  const { amount, fiatAmount } = formatMetrics(totalAllocations, price, symbol, currency)

  return (
    <>
      <MetricsCard borderless>
        <MetricsCardTitle
          title="Total allocations"
          data-testid="TotalAllocations"
          tooltip={{
            text: 'Total stRIF allocation from Backers to Builders. Backers retain full ownership and access to their stRIF.',
            popoverProps: { size: 'medium' },
          }}
        />
        <>
          {withSpinner(TokenMetricsCardRow, { className: 'min-h-0 grow-0', size: 'small' })({
            amount,
            fiatAmount,
            isLoading,
          })}
        </>
      </MetricsCard>
    </>
  )
}

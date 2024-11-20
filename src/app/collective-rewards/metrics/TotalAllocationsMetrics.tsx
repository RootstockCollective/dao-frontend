import { useGaugesGetFunction } from '@/app/collective-rewards/shared/hooks'
import { Address } from 'viem'
import { FC } from 'react'
import { usePricesContext } from '@/shared/context/PricesContext'
import { formatCurrency } from '@/lib/utils'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { MetricsCard, MetricsCardTitle, TokenMetricsCardRow, Token } from '@/app/collective-rewards/rewards'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { useHandleErrors } from '@/app/collective-rewards/utils'

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
  const { data, isLoading, error } = useGaugesGetFunction(gauges, 'totalAllocation')
  useHandleErrors({ error, title: 'Error loading total allocations' })

  const price = prices[symbol]?.price ?? 0

  const totalAllocations = Object.values(data).reduce((acc, allocation) => acc + allocation, 0n)
  const totalAllocationsInHuman = Number(formatBalanceToHuman(totalAllocations))
  const fiatAmount = `= ${currency} ${formatCurrency(totalAllocationsInHuman * price, currency)}`

  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Total allocations"
        data-testid="TotalAllocations"
        tooltip={{
          text: 'Total stRIF allocation from Backers to Builders',
        }}
      />
      {withSpinner(
        TokenMetricsCardRow,
        'min-h-0 grow-0',
      )({
        amount: `${totalAllocationsInHuman} STRIF`,
        fiatAmount,
        isLoading,
      })}
    </MetricsCard>
  )
}

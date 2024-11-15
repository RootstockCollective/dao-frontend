import { useGaugesGetFunction } from '@/app/collective-rewards/hooks'
import { Address } from 'viem'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { MetricsCardWithSpinner } from '@/components/MetricsCard/MetricsCard'
import { FC } from 'react'
import { usePricesContext } from '@/shared/context/PricesContext'
import { Token } from '@/app/collective-rewards/rewards'
import { formatCurrency } from '@/lib/utils'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'

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
  const { data, isLoading, error } = useGaugesGetFunction<bigint>(gauges, 'totalAllocation', [])
  useHandleErrors({ error, title: 'Error loading total allocations' })

  const price = prices[symbol]?.price ?? 0

  const totalAllocations = Object.values(data).reduce((acc, allocation) => acc + allocation, 0n)
  const totalAllocationsInHuman = Number(formatBalanceToHuman(totalAllocations))
  const fiatAmount = `= ${currency} ${formatCurrency(totalAllocationsInHuman * price, currency)}`

  return (
    <MetricsCardWithSpinner
      title="Total allocations"
      amount={`${totalAllocationsInHuman} STRIF`}
      fiatAmount={fiatAmount}
      isLoading={isLoading}
      borderless
    />
  )
}

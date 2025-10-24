import { useHandleErrors } from '@/app/collective-rewards/utils'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards'
import { Address } from 'viem'
import { useGetBuilderAllTimeRewards } from '@/app/my-rewards/builder/hooks/useGetBuilderAllTimeRewards'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricToken } from '@/app/components/Metric/types'
import { Header, Span } from '@/components/Typography'
import { RBTC, RIF, USD, USDRIF } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { useMemo } from 'react'

export const TotalEarned = ({ gauge }: { gauge: Address }) => {
  const { rif: rifData, rbtc: rbtcData } = useGetBuilderAllTimeRewards({
    gauge,
  })
  const { prices } = usePricesContext()
  useHandleErrors({ error: rifData.error ?? rbtcData.error, title: 'Error loading total earned' })

  const { segments, totalUsdValue } = useMemo(() => {
    const rifPrice = prices[RIF]?.price ?? 0
    const rbtcPrice = prices[RBTC]?.price ?? 0
    const usdrifPrice = prices[USDRIF]?.price ?? 1

    // Extract numeric part and convert
    const rifAmount = BigInt(Math.floor(parseFloat(rifData.amount.split(' ')[0]) * 1e18))
    const rbtcAmount = BigInt(Math.floor(parseFloat(rbtcData.amount.split(' ')[0]) * 1e18))

    // FIXME: Mock USDRIF values with RIF values - replace with real API data when available
    const usdrifAmount = rifAmount

    const rifFiatValue = getFiatAmount(rifAmount, rifPrice)
    const rbtcFiatValue = getFiatAmount(rbtcAmount, rbtcPrice)
    const usdrifFiatValue = getFiatAmount(usdrifAmount, usdrifPrice)

    const totalUsdValue = rifFiatValue.add(rbtcFiatValue).add(usdrifFiatValue)

    const segments: MetricToken[] = [
      {
        symbol: RIF,
        value: rifData.amount,
        fiatValue: rifFiatValue.toString(),
      },
      {
        symbol: RBTC,
        value: rbtcData.amount,
        fiatValue: rbtcFiatValue.toString(),
      },
      {
        symbol: USDRIF,
        value: rifData.amount,
        fiatValue: usdrifFiatValue.toString(),
      },
    ]

    return { segments, totalUsdValue }
  }, [rifData, rbtcData, prices])

  return (
    <RewardCard
      data-testid="total-earned"
      isLoading={rifData.isLoading || rbtcData.isLoading}
      title="Total earned"
      info="Your total rewards earned across all cycles"
      className="flex-row sm:flex-col justify-between w-full"
    >
      <div className="flex items-center gap-2">
        <Header variant="h3">{formatCurrency(totalUsdValue)}</Header>
        <Span variant="body-s" bold>
          {USD}
        </Span>
      </div>
      <MetricBar segments={segments} className="w-full max-w-[180px]" />
    </RewardCard>
  )
}

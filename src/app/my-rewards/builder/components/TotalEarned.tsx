import { useHandleErrors } from '@/app/collective-rewards/utils'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards'
import { Address } from 'viem'
import { useGetBuilderAllTimeRewards } from '@/app/my-rewards/builder/hooks/useGetBuilderAllTimeRewards'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricToken } from '@/app/components/Metric/types'
import { Header } from '@/components/Typography'
import { RBTC, RIF, USDRIF } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { useMemo } from 'react'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { FiatTooltipLabel } from '@/app/components/Tooltip/FiatTooltipLabel/FiatTooltipLabel'

export const TotalEarned = ({ gauge }: { gauge: Address }) => {
  const {
    rif: rifAllTimeRewards,
    rbtc: rbtcAllTimeRewards,
    usdrif: usdrifAllTimeRewards,
    isLoading,
    error,
  } = useGetBuilderAllTimeRewards({
    gauge,
  })
  const { prices } = usePricesContext()
  useHandleErrors({ error, title: 'Error loading total earned' })

  const { segments, totalUsdValue } = useMemo(() => {
    const rifPrice = prices[RIF]?.price ?? 0
    const rbtcPrice = prices[RBTC]?.price ?? 0
    const usdrifPrice = prices[USDRIF]?.price ?? 0

    const rifFiatValue = getFiatAmount(rifAllTimeRewards, rifPrice)
    const rbtcFiatValue = getFiatAmount(rbtcAllTimeRewards, rbtcPrice)
    const usdrifFiatValue = getFiatAmount(usdrifAllTimeRewards, usdrifPrice)

    const totalUsdValue = rifFiatValue.add(rbtcFiatValue).add(usdrifFiatValue)

    const segments: MetricToken[] = [
      {
        symbol: RIF,
        value: formatSymbol(rifAllTimeRewards, RIF),
        fiatValue: rifFiatValue.toFixed(2),
      },
      {
        symbol: RBTC,
        value: formatSymbol(rbtcAllTimeRewards, RBTC),
        fiatValue: rbtcFiatValue.toFixed(2),
      },
      {
        symbol: USDRIF,
        value: formatSymbol(usdrifAllTimeRewards, USDRIF),
        fiatValue: usdrifFiatValue.toFixed(2),
      },
    ]

    return { segments, totalUsdValue }
  }, [rifAllTimeRewards, rbtcAllTimeRewards, usdrifAllTimeRewards, prices])

  return (
    <RewardCard
      data-testid="total-earned"
      isLoading={isLoading}
      title="Total earned"
      info="Your total rewards earned across all cycles"
      className="flex-row sm:flex-col justify-between w-full"
    >
      <div className="flex items-center gap-2">
        <Header variant="h3">
          {formatCurrency(totalUsdValue, { showCurrencySymbol: false })}{' '}
          <FiatTooltipLabel tooltip={{ side: 'top', text: <MetricTooltipContent tokens={segments} /> }} />
        </Header>
      </div>
      <MetricBar segments={segments} className="w-full max-w-[180px]" />
    </RewardCard>
  )
}

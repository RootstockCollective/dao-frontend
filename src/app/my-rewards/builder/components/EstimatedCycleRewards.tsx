import { useHandleErrors } from '@/app/collective-rewards/utils'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards'
import { Address } from 'viem'
import { useGetBuilderEstimatedRewards } from '@/app/my-rewards/builder/hooks/useGetBuilderEstimatedRewards'
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

export const EstimatedCycleRewards = ({ builder, gauge }: { builder: Address; gauge: Address }) => {
  const {
    rif: rifAmount,
    rbtc: rbtcAmount,
    usdrif: usdrifAmount,
    isLoading,
    error,
  } = useGetBuilderEstimatedRewards({
    builder: builder,
    gauge,
  })
  const { prices } = usePricesContext()
  useHandleErrors({ error, title: 'Error loading estimated rewards' })

  const { segments, totalUsdValue } = useMemo(() => {
    const rifPrice = prices[RIF]?.price ?? 0
    const rbtcPrice = prices[RBTC]?.price ?? 0
    const usdrifPrice = prices[USDRIF]?.price ?? 0

    const rifFiatValue = getFiatAmount(rifAmount, rifPrice)
    const rbtcFiatValue = getFiatAmount(rbtcAmount, rbtcPrice)
    const usdrifFiatValue = getFiatAmount(usdrifAmount, usdrifPrice)

    const totalUsdValue = rifFiatValue.add(rbtcFiatValue).add(usdrifFiatValue)

    const segments: MetricToken[] = [
      {
        symbol: RIF,
        value: formatSymbol(rifAmount, RIF),
        fiatValue: rifFiatValue.toFixed(2),
      },
      {
        symbol: RBTC,
        value: formatSymbol(rbtcAmount, RBTC),
        fiatValue: rbtcFiatValue.toFixed(2),
      },
      {
        symbol: USDRIF,
        value: formatSymbol(usdrifAmount, USDRIF),
        fiatValue: usdrifFiatValue.toFixed(2),
      },
    ]

    return { segments, totalUsdValue }
  }, [rifAmount, rbtcAmount, usdrifAmount, prices])

  return (
    <RewardCard
      data-testid="estimated-cycle-rewards"
      isLoading={isLoading}
      title="Estimated this cycle"
      info="Your estimated rewards which will become claimable at the start of the next Cycle."
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

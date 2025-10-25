import { RewardCard } from '@/app/my-rewards/components/RewardCard'

import { formatSymbol, getFiatAmount, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { useBackerEstimatedRewards } from '../hooks/useBackerEstimatedRewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricToken } from '@/app/components/Metric/types'
import { Header } from '@/components/Typography'
import { RBTC, RIF, USDRIF } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { useMemo } from 'react'
import { FiatTooltipLabel } from '@/app/components/Tooltip/FiatTooltipLabel/FiatTooltipLabel'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'

export const BackerEstimatedRewards = () => {
  const { rif: rifData, rbtc: rbtcData, usdrif: usdrifData } = useBackerEstimatedRewards()
  const { data: backerRewards } = useBackerRewardsContext()
  const { prices } = usePricesContext()
  useHandleErrors({
    error: rifData.error ?? rbtcData.error ?? usdrifData.error,
    title: 'Error loading backer estimated rewards',
  })

  const { segments, totalUsdValue } = useMemo(() => {
    const rifPrice = prices[RIF]?.price ?? 0
    const rbtcPrice = prices[RBTC]?.price ?? 0
    const usdrifPrice = prices[USDRIF]?.price ?? 0

    const rifFiatValue = getFiatAmount(rifData.amount, rifPrice)
    const rbtcFiatValue = getFiatAmount(rbtcData.amount, rbtcPrice)
    const usdrifFiatValue = getFiatAmount(usdrifData.amount, usdrifPrice)

    const totalUsdValue = rifFiatValue.add(rbtcFiatValue).add(usdrifFiatValue)

    const segments: MetricToken[] = [
      {
        symbol: RIF,
        value: formatSymbol(rifData.amount, RIF),
        fiatValue: rifFiatValue.toFixed(2),
      },
      {
        symbol: RBTC,
        value: formatSymbol(rbtcData.amount, RBTC),
        fiatValue: rbtcFiatValue.toFixed(2),
      },
      {
        symbol: USDRIF,
        value: formatSymbol(usdrifData.amount, USDRIF),
        fiatValue: usdrifFiatValue.toFixed(2),
      },
    ]

    return { segments, totalUsdValue }
  }, [rifData.amount, rbtcData.amount, usdrifData.amount, prices])

  return (
    <RewardCard
      isLoading={rifData.isLoading || rbtcData.isLoading}
      title="Estimated this cycle"
      info={
        <span className="flex flex-col gap-2 text-wrap max-w-[35rem]">
          <span>
            An estimate of the remainder of this Cycle&apos;s rewards that will become fully claimable by the
            end of the current Cycle. These rewards gradually transition into your &apos;Claimable
            Rewards&apos; as the cycle progresses.
          </span>
          <span className="mt-2 mb-2">
            To check the cycle&apos;s completion, go to Collective Rewards → Current Cycle.
          </span>
          <span>
            The displayed information is dynamic and may vary based on total rewards and user activity. This
            data is for informational purposes only.
          </span>
        </span>
      }
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

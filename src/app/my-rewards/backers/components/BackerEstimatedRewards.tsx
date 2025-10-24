import { RewardCard } from '@/app/my-rewards/components/RewardCard'

import { formatSymbol, getFiatAmount, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { useBackerEstimatedRewards } from '../hooks/useBackerEstimatedRewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricToken } from '@/app/components/Metric/types'
import { Header, Span } from '@/components/Typography'
import { RBTC, RIF, USD, USDRIF } from '@/lib/constants'
import { TOKENS } from '@/lib/tokens'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { useMemo } from 'react'

export const BackerEstimatedRewards = () => {
  const { rif: rifData, rbtc: rbtcData } = useBackerEstimatedRewards()
  const { data: backerRewards } = useBackerRewardsContext()
  const { prices } = usePricesContext()
  useHandleErrors({ error: rifData.error ?? rbtcData.error, title: 'Error loading backer estimated rewards' })

  const { segments, totalUsdValue } = useMemo(() => {
    const rifPrice = prices[RIF]?.price ?? 0
    const rbtcPrice = prices[RBTC]?.price ?? 0
    const usdrifPrice = prices[USDRIF]?.price ?? 1

    // Get raw bigint values from the context
    const rifEstimated = backerRewards[TOKENS.rif.address]?.estimated ?? {}
    const rbtcEstimated = backerRewards[TOKENS.rbtc.address]?.estimated ?? {}

    const rifAmount = Object.values(rifEstimated).reduce((acc, estimated) => acc + estimated, 0n)
    const rbtcAmount = Object.values(rbtcEstimated).reduce((acc, estimated) => acc + estimated, 0n)

    // FIXME: Mock USDRIF values with RIF values - replace with real API data when available
    const usdrifAmount = rifAmount

    const rifFiatValue = getFiatAmount(rifAmount, rifPrice)
    const rbtcFiatValue = getFiatAmount(rbtcAmount, rbtcPrice)
    const usdrifFiatValue = getFiatAmount(usdrifAmount, usdrifPrice)

    const totalUsdValue = rifFiatValue.add(rbtcFiatValue).add(usdrifFiatValue)

    const segments: MetricToken[] = [
      {
        symbol: RIF,
        value: formatSymbol(rifAmount, RIF),
        fiatValue: rifFiatValue.toString(),
      },
      {
        symbol: RBTC,
        value: formatSymbol(rbtcAmount, RBTC),
        fiatValue: rbtcFiatValue.toString(),
      },
      {
        symbol: USDRIF,
        value: formatSymbol(usdrifAmount, USDRIF),
        fiatValue: usdrifFiatValue.toString(),
      },
    ]

    return { segments, totalUsdValue }
  }, [backerRewards, prices])

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
        <Header variant="h3">{formatCurrency(totalUsdValue)}</Header>
        <Span variant="body-s" bold>
          {USD}
        </Span>
      </div>
      <MetricBar segments={segments} className="w-full max-w-[180px]" />
    </RewardCard>
  )
}

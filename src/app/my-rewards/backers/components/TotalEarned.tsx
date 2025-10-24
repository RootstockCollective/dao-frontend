import { RewardCard } from '@/app/my-rewards/components/RewardCard'

import { formatSymbol, getFiatAmount, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useBackerTotalEarned } from '../hooks/useBackerTotalEarned'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricToken } from '@/app/components/Metric/types'
import { Header, Span } from '@/components/Typography'
import { RBTC, RIF, USD, USDRIF } from '@/lib/constants'
import { TOKENS } from '@/lib/tokens'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { useMemo } from 'react'

export const TotalEarned = () => {
  const { rif: rifData, rbtc: rbtcData } = useBackerTotalEarned()
  const { data: backerRewards } = useBackerRewardsContext()
  const { prices } = usePricesContext()
  useHandleErrors({ error: rifData.error ?? rbtcData.error, title: 'Error loading backer total earned' })

  const { segments, totalUsdValue } = useMemo(() => {
    const rifPrice = prices[RIF]?.price ?? 0
    const rbtcPrice = prices[RBTC]?.price ?? 0
    const usdrifPrice = prices[USDRIF]?.price ?? 1

    // Get raw bigint values from the context (same logic as the hook)
    const rifData = backerRewards[TOKENS.rif.address]
    const rbtcData = backerRewards[TOKENS.rbtc.address]

    const rifEarned = Object.values(rifData?.earned ?? {}).reduce((acc, earned) => acc + earned, 0n)
    const rifClaimed = Object.values(rifData?.claimed ?? {}).reduce(
      (acc, value) => acc + value.reduce((acc, value) => acc + value.args.amount_, 0n),
      0n,
    )
    const rifAmount = rifEarned + rifClaimed

    const rbtcEarned = Object.values(rbtcData?.earned ?? {}).reduce((acc, earned) => acc + earned, 0n)
    const rbtcClaimed = Object.values(rbtcData?.claimed ?? {}).reduce(
      (acc, value) => acc + value.reduce((acc, value) => acc + value.args.amount_, 0n),
      0n,
    )
    const rbtcAmount = rbtcEarned + rbtcClaimed

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
      title="Total earned"
      info="Total of your received and claimable rewards"
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

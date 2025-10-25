import { RewardCard } from '@/app/my-rewards/components/RewardCard'

import ClaimRewardsModal from '@/app/collective-rewards/components/ClaimRewardModal/ClaimRewardsModal'
import { formatSymbol, getFiatAmount, useBackerRewardsContext } from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useBackerUnclaimedRewards } from '@/app/my-rewards/backers/hooks/useBackerUnclaimedRewards'
import { ClaimRewardsButton } from '@/app/my-rewards/components/ClaimRewardsButton'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricToken } from '@/app/components/Metric/types'
import { Header } from '@/components/Typography'
import { RBTC, RIF, USDRIF } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { useModal } from '@/shared/hooks/useModal'
import { useMemo } from 'react'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { FiatTooltipLabel } from '@/app/components/Tooltip/FiatTooltipLabel/FiatTooltipLabel'

export const UnclaimedRewards = () => {
  const { isModalOpened, openModal, closeModal } = useModal()
  const { rif: rifData, rbtc: rbtcData, usdrif: usdrifData } = useBackerUnclaimedRewards()
  const { data: backerRewards } = useBackerRewardsContext()
  const { prices } = usePricesContext()
  useHandleErrors({
    error: rifData.error ?? rbtcData.error ?? usdrifData.error,
    title: 'Error loading backer unclaimed rewards',
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
      title="Unclaimed"
      info="Your rewards available to claim"
      className="w-full"
    >
      <div className="flex items-center gap-2">
        <Header variant="h3">
          {formatCurrency(totalUsdValue, { showCurrencySymbol: false })}{' '}
          <FiatTooltipLabel tooltip={{ side: 'top', text: <MetricTooltipContent tokens={segments} /> }} />
        </Header>
      </div>
      <MetricBar segments={segments} className="w-full max-w-[180px]" />
      <div className="flex justify-start">
        <ClaimRewardsButton onClick={() => openModal()} />
      </div>
      <ClaimRewardsModal open={isModalOpened} onClose={() => closeModal()} isBacker={true} />
    </RewardCard>
  )
}

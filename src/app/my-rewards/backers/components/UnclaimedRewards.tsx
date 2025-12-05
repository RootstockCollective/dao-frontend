import { RewardCard } from '@/app/my-rewards/components/RewardCard'

import ClaimRewardsModal from '@/app/collective-rewards/components/ClaimRewardModal/ClaimRewardsModal'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { FiatTooltipLabel } from '@/app/components/Tooltip/FiatTooltipLabel/FiatTooltipLabel'
import { useBackerUnclaimedRewards } from '@/app/my-rewards/backers/hooks/useBackerUnclaimedRewards'
import { ClaimRewardsButton } from '@/app/my-rewards/components/ClaimRewardsButton'
import { getMetricTokens } from '@/app/shared/utils'
import { Header } from '@/components/Typography'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { useModal } from '@/shared/hooks/useModal'
import { useMemo } from 'react'

export const UnclaimedRewards = () => {
  const { isModalOpened, openModal, closeModal } = useModal()
  const tokens = useBackerUnclaimedRewards()
  const { prices } = usePricesContext()
  useHandleErrors({
    error: tokens.rif.error ?? tokens.rbtc.error ?? tokens.usdrif.error,
    title: 'Error loading backer unclaimed rewards',
  })

  const { metricTokens, total } = useMemo(
    () =>
      getMetricTokens(
        {
          rif: tokens.rif.amount,
          rbtc: tokens.rbtc.amount,
          usdrif: tokens.usdrif.amount,
        },
        prices,
      ),
    [tokens, prices],
  )

  return (
    <RewardCard
      isLoading={tokens.rbtc.isLoading || tokens.rif.isLoading || tokens.usdrif.isLoading}
      title="Unclaimed"
      info="Your rewards available to claim"
      className="w-full"
    >
      <div className="flex items-center gap-2">
        <Header variant="h3">
          {formatCurrency(total, { showCurrencySymbol: false })}{' '}
          <FiatTooltipLabel tooltip={{ side: 'top', text: <MetricTooltipContent tokens={metricTokens} /> }} />
        </Header>
      </div>
      <MetricBar segments={metricTokens} className="w-full md:max-w-[180px]" />
      <div className="flex justify-start">
        <ClaimRewardsButton onClick={() => openModal()} />
      </div>
      <ClaimRewardsModal open={isModalOpened} onClose={() => closeModal()} isBacker={true} />
    </RewardCard>
  )
}

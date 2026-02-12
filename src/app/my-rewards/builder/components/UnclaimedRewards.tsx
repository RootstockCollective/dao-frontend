import ClaimRewardsModal from '@/app/collective-rewards/components/ClaimRewardModal/ClaimRewardsModal'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { FiatTooltipLabel } from '@/app/components/Tooltip/FiatTooltipLabel/FiatTooltipLabel'
import { useGetBuilderUnclaimedRewards } from '@/app/my-rewards/builder/hooks/useGetBuilderUnclaimedRewards'
import { ClaimRewardsButton } from '@/app/my-rewards/components/ClaimRewardsButton'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { Header } from '@/components/Typography'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { useModal } from '@/shared/hooks/useModal'
import { Address } from 'viem'
import { getMetricTokens } from '@/app/shared/utils'
import { useMemo } from 'react'

export const UnclaimedRewards = ({ builder, gauge }: { builder: Address; gauge: Address }) => {
  const { isModalOpened, openModal, closeModal } = useModal()
  const { isLoading, error, ...tokens } = useGetBuilderUnclaimedRewards({
    builder: builder!,
    gauge,
  })
  const { prices } = usePricesContext()
  useHandleErrors({ error, title: 'Error loading unclaimed rewards' })

  const { metricTokens, total } = useMemo(() => getMetricTokens(tokens, prices), [tokens, prices])

  return (
    <RewardCard
      data-testid="unclaimed-rewards"
      isLoading={isLoading}
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
      {isModalOpened && <ClaimRewardsModal onClose={closeModal} isBacker={false} />}
    </RewardCard>
  )
}

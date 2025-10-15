import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { TokenAmount } from '@/components/TokenAmount'

import ClaimRewardsModal from '@/app/collective-rewards/components/ClaimRewardModal/ClaimRewardsModal'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useBackerUnclaimedRewards } from '@/app/my-rewards/backers/hooks/useBackerUnclaimedRewards'
import { ClaimRewardsButton } from '@/app/my-rewards/components/ClaimRewardsButton'
import { RBTC, RIF } from '@/lib/tokens'
import { useModal } from '@/shared/hooks/useModal'

export const UnclaimedRewards = () => {
  const { isModalOpened, openModal, closeModal } = useModal()
  const { [RIF]: rifData, [RBTC]: rbtcData } = useBackerUnclaimedRewards()
  useHandleErrors({
    error: rifData?.error ?? rbtcData?.error,
    title: 'Error loading backer unclaimed rewards',
  })

  return (
    <RewardCard
      isLoading={rifData?.isLoading || rbtcData?.isLoading || false}
      title="Unclaimed"
      info="Your rewards available to claim"
      className="w-full sm:w-auto"
    >
      <div className="flex sm:flex-col justify-between w-full">
        <TokenAmount
          amount={rifData?.amount ?? '0'}
          tokenSymbol={RIF}
          amountInFiat={rifData?.fiatAmount ?? '0'}
        />
        <TokenAmount
          amount={rbtcData?.amount ?? '0'}
          tokenSymbol={RBTC}
          amountInFiat={rbtcData?.fiatAmount ?? '0'}
        />
      </div>
      <div className="flex justify-start">
        <ClaimRewardsButton onClick={() => openModal()} />
      </div>
      <ClaimRewardsModal open={isModalOpened} onClose={() => closeModal()} isBacker={true} />
    </RewardCard>
  )
}

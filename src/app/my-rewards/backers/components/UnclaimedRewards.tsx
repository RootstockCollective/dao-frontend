import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { TokenAmount } from '@/components/TokenAmount'

import ClaimRewardsModal from '@/app/collective-rewards/components/ClaimRewardModal/ClaimRewardsModal'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useBackerUnclaimedRewards } from '@/app/my-rewards/backers/hooks/useBackerUnclaimedRewards'
import { ClaimRewardsButton } from '@/app/my-rewards/components/ClaimRewardsButton'
import { TokenSymbol } from '@/components/TokenImage'
import { useState } from 'react'

export const UnclaimedRewards = () => {
  const [claimRewardsModalOpen, setClaimRewardsModalOpen] = useState(false)
  const { rif: rifData, rbtc: rbtcData } = useBackerUnclaimedRewards()
  useHandleErrors({ error: rifData.error ?? rbtcData.error, title: 'Error loading backer unclaimed rewards' })

  return (
    <RewardCard
      isLoading={rifData.isLoading || rbtcData.isLoading}
      title="Unclaimed"
      info="Your rewards available to claim"
      className="w-full sm:w-auto"
    >
      <div className="flex sm:flex-col justify-between w-full">
        <TokenAmount
          amount={rifData.amount}
          tokenSymbol={TokenSymbol.RIF}
          amountInFiat={rifData.fiatAmount}
        />
        <TokenAmount
          amount={rbtcData.amount}
          tokenSymbol={TokenSymbol.RBTC}
          amountInFiat={rbtcData.fiatAmount}
        />
      </div>
      <div className="flex justify-start">
        <ClaimRewardsButton onClick={() => setClaimRewardsModalOpen(true)} />
      </div>
      <ClaimRewardsModal
        open={claimRewardsModalOpen}
        onClose={() => setClaimRewardsModalOpen(false)}
        isBacker={true}
      />
    </RewardCard>
  )
}

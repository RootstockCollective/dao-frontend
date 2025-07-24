import ClaimRewardsModal from '@/app/collective-rewards/components/ClaimRewardModal/ClaimRewardsModal'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useGetBuilderUnclaimedRewards } from '@/app/my-rewards/builder/hooks/useGetBuilderUnclaimedRewards'
import { ClaimRewardsButton } from '@/app/my-rewards/components/ClaimRewardsButton'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { TokenAmount } from '@/components/TokenAmount'
import { TokenSymbol } from '@/components/TokenImage'
import { useState } from 'react'
import { Address } from 'viem'

export const UnclaimedRewards = ({ builder, gauge }: { builder: Address; gauge: Address }) => {
  const [claimRewardsModalOpen, setClaimRewardsModalOpen] = useState(false)
  const { rif: rifData, rbtc: rbtcData } = useGetBuilderUnclaimedRewards({
    builder: builder!,
    gauge,
  })
  useHandleErrors({ error: rifData.error ?? rbtcData.error, title: 'Error loading unclaimed rewards' })

  return (
    <RewardCard
      data-testid="unclaimed-rewards"
      isLoading={rifData.isLoading || rbtcData.isLoading}
      title="Unclaimed"
      info="Your rewards available to claim"
    >
      <TokenAmount amount={rifData.amount} tokenSymbol={TokenSymbol.RIF} amountInFiat={rifData.fiatAmount} />
      <TokenAmount
        amount={rbtcData.amount}
        tokenSymbol={TokenSymbol.RBTC}
        amountInFiat={rbtcData.fiatAmount}
      />
      <div className="flex justify-start">
        <ClaimRewardsButton onClick={() => setClaimRewardsModalOpen(true)} />
      </div>
      <ClaimRewardsModal
        open={claimRewardsModalOpen}
        onClose={() => setClaimRewardsModalOpen(false)}
        isBacker={false}
      />
    </RewardCard>
  )
}

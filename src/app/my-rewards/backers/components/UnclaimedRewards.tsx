import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { TokenAmount } from '@/components/TokenAmount'

import { useBackerUnclaimedRewards } from '../hooks/useBackerUnclaimedRewards'
import { ClaimRewardsButton } from '@/app/my-rewards/components/ClaimRewardsButton'
import { TokenSymbol } from '@/components/TokenImage'
import { useHandleErrors } from '@/app/collective-rewards/utils'

export const UnclaimedRewards = () => {
  const { rif: rifData, rbtc: rbtcData } = useBackerUnclaimedRewards()
  useHandleErrors({ error: rifData.error ?? rbtcData.error, title: 'Error loading backer unclaimed rewards' })

  return (
    <RewardCard
      isLoading={rifData.isLoading || rbtcData.isLoading}
      title="Unclaimed"
      info="Your rewards available to claim"
      content={
        <>
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
          <div className="flex justify-start">
            <ClaimRewardsButton
              onClick={() => alert('Claim Rewards (placeholder - to be implemented in separate task)')}
            />
          </div>
        </>
      }
    />
  )
}

import { useHandleErrors } from '@/app/collective-rewards/utils'
import { TokenAmount } from '@/components/TokenAmount'
import { TokenSymbol } from '@/components/TokenImage'
import { Address } from 'viem'
import { useGetBuilderUnclaimedRewards } from '@/app/my-rewards/builder/hooks/useGetBuilderUnclaimedRewards'
import { ClaimRewardsButton } from '@/app/my-rewards/components/ClaimRewardsButton'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'

export const UnclaimedRewards = ({ builder, gauge }: { builder: Address; gauge: Address }) => {
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
        <ClaimRewardsButton
          onClick={() => alert('Claim Rewards (placeholder - to be implemented in separate task)')}
        />
      </div>
    </RewardCard>
  )
}

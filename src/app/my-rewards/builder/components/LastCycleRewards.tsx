import { TokenAmount } from '@/components/TokenAmount'
import { TokenSymbol } from '@/components/TokenImage'
import { Address } from 'viem'
import { useGetBuilderLastCycleRewards } from '@/app/my-rewards/builder/hooks/useGetBuilderLastCycleRewards'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'

export const LastCycleRewards = ({ gauge }: { gauge: Address }) => {
  const { rif: rifData, rbtc: rbtcData } = useGetBuilderLastCycleRewards({
    gauge,
  })

  return (
    <RewardCard
      data-testid="last-cycle-rewards"
      isLoading={rifData.isLoading || rbtcData.isLoading}
      title="Last cycle"
      info="Your rewards from the previous cycle"
    >
      <TokenAmount amount={rifData.amount} tokenSymbol={TokenSymbol.RIF} amountInFiat={rifData.fiatAmount} />
      <TokenAmount
        amount={rbtcData.amount}
        tokenSymbol={TokenSymbol.RBTC}
        amountInFiat={rbtcData.fiatAmount}
      />
    </RewardCard>
  )
}

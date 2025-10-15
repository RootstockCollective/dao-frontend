import { useGetBuilderLastCycleRewards } from '@/app/my-rewards/builder/hooks/useGetBuilderLastCycleRewards'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { TokenAmount } from '@/components/TokenAmount'
import { RBTC, RIF } from '@/lib/tokens'
import { Address } from 'viem'

export const LastCycleRewards = ({ gauge }: { gauge: Address }) => {
  const { [RIF]: rifData, [RBTC]: rbtcData } = useGetBuilderLastCycleRewards({
    gauge,
  })

  return (
    <RewardCard
      data-testid="last-cycle-rewards"
      isLoading={rifData?.isLoading || rbtcData?.isLoading || false}
      title="Last cycle"
      info="Your rewards from the previous cycle"
      className="flex-row sm:flex-col justify-between w-full sm:w-auto"
    >
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
    </RewardCard>
  )
}

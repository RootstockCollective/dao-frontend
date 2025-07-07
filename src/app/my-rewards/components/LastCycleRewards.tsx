import { TokenAmount } from '@/components/TokenAmount'
import { TokenSymbol } from '@/components/TokenImage'
import { Address } from 'viem'
import { useBuilderLastCycleRewards } from '../hooks/useBuilderLastCycleRewards'
import { RewardCard } from './RewardCard'

export const LastCycleRewards = ({ gauge }: { gauge: Address }) => {
  const { rif: rifData, rbtc: rbtcData } = useBuilderLastCycleRewards({
    gauge,
  })

  return (
    <RewardCard
      data-testid="last-cycle-rewards"
      isLoading={rifData.isLoading || rbtcData.isLoading}
      title="Last cycle"
      info="Your rewards from the previous cycle"
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
        </>
      }
    />
  )
}

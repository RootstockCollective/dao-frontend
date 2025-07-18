import { useHandleErrors } from '@/app/collective-rewards/utils'
import { TokenAmount } from '@/components/TokenAmount'
import { TokenSymbol } from '@/components/TokenImage'
import { Address } from 'viem'
import { useBuilderAllTimeRewards } from '@/app/my-rewards/builder/hooks/useBuilderAllTimeRewards'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'

export const TotalEarned = ({ gauge }: { gauge: Address }) => {
  const { rif: rifData, rbtc: rbtcData } = useBuilderAllTimeRewards({
    gauge,
  })

  useHandleErrors({ error: rifData.error ?? rbtcData.error, title: 'Error loading total earned' })

  return (
    <RewardCard
      data-testid="total-earned"
      isLoading={rifData.isLoading || rbtcData.isLoading}
      title="Total earned"
      info="Your total rewards earned across all cycles"
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

import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { TokenAmount } from '@/components/TokenAmount'
import { TokenSymbol } from '@/components/TokenImage'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useBackersEstimatedRewards } from '../hooks/useBackersEstimatedRewards'

export const BackersEstimatedRewards = () => {
  const { rif: rifData, rbtc: rbtcData } = useBackersEstimatedRewards()

  useHandleErrors({
    error: rifData.error ?? rbtcData.error,
    title: 'Error loading backers estimated rewards',
  })

  return (
    <RewardCard
      isLoading={rifData.isLoading || rbtcData.isLoading}
      title="Estimated this cycle"
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
        </>
      }
    />
  )
}

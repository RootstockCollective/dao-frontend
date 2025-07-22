import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { TokenAmount } from '@/components/TokenAmount'

import { TokenSymbol } from '@/components/TokenImage'
import { useBackerEstimatedRewards } from '../hooks/useBackerEstimatedRewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'

export const BackerEstimatedRewards = () => {
  const { rif: rifData, rbtc: rbtcData } = useBackerEstimatedRewards()
  useHandleErrors({ error: rifData.error ?? rbtcData.error, title: 'Error loading backer estimated rewards' })

  return (
    <RewardCard
      isLoading={rifData.isLoading || rbtcData.isLoading}
      title="Estimated this cycle"
      info="Your rewards available to claim"
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

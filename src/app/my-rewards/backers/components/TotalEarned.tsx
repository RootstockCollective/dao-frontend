import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { TokenAmount } from '@/components/TokenAmount'

import { TokenSymbol } from '@/components/TokenImage'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useBackerTotalEarned } from '../hooks/useBackerTotalEarned'

export const TotalEarned = () => {
  const { rif: rifData, rbtc: rbtcData } = useBackerTotalEarned()
  useHandleErrors({ error: rifData.error ?? rbtcData.error, title: 'Error loading backer total earned' })

  return (
    <RewardCard
      isLoading={rifData.isLoading || rbtcData.isLoading}
      title="Total earned"
      info="Total of your received and claimable rewards"
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

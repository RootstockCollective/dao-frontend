import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { TokenAmount } from '@/components/TokenAmount'

import { useHandleErrors } from '@/app/collective-rewards/utils'
import { RBTC, RIF } from '@/lib/tokens'
import { useBackerTotalEarned } from '../hooks/useBackerTotalEarned'

export const TotalEarned = () => {
  const { [RIF]: rifData, [RBTC]: rbtcData } = useBackerTotalEarned()
  useHandleErrors({ error: rifData?.error ?? rbtcData?.error, title: 'Error loading backer total earned' })

  return (
    <RewardCard
      isLoading={rifData?.isLoading || rbtcData?.isLoading || false}
      title="Total earned"
      info="Total of your received and claimable rewards"
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

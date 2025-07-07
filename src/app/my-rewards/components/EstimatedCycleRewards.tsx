import { useHandleErrors } from '@/app/collective-rewards/utils'
import { TokenAmount } from '@/components/TokenAmount'
import { TokenSymbol } from '@/components/TokenImage'
import { Address } from 'viem'
import { useBuilderEstimatedRewards } from '../hooks/useBuilderEstimatedRewards'
import { RewardCard } from './RewardCard'

export const EstimatedCycleRewards = ({ builder, gauge }: { builder: Address; gauge: Address }) => {
  const { rif: rifData, rbtc: rbtcData } = useBuilderEstimatedRewards({
    builder: builder,
    gauge,
  })

  useHandleErrors({ error: rifData.error ?? rbtcData.error, title: 'Error loading estimated rewards' })

  return (
    <RewardCard
      data-testid="estimated-cycle-rewards"
      isLoading={rifData.isLoading || rbtcData.isLoading}
      title="Estimated this cycle"
      info="Your estimated rewards which will become claimable at the start of the next Cycle."
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

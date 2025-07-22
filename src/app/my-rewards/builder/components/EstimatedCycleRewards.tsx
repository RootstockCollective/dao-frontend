import { useHandleErrors } from '@/app/collective-rewards/utils'
import { TokenAmount } from '@/components/TokenAmount'
import { TokenSymbol } from '@/components/TokenImage'
import { Address } from 'viem'
import { useGetBuilderEstimatedRewards } from '@/app/my-rewards/builder/hooks/useGetBuilderEstimatedRewards'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'

export const EstimatedCycleRewards = ({ builder, gauge }: { builder: Address; gauge: Address }) => {
  const { rif: rifData, rbtc: rbtcData } = useGetBuilderEstimatedRewards({
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

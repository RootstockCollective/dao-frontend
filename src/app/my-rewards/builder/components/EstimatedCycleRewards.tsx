import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useGetBuilderEstimatedRewards } from '@/app/my-rewards/builder/hooks/useGetBuilderEstimatedRewards'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { TokenAmount } from '@/components/TokenAmount'
import { RBTC, RIF } from '@/lib/tokens'
import { Address } from 'viem'

export const EstimatedCycleRewards = ({ builder, gauge }: { builder: Address; gauge: Address }) => {
  const { [RIF]: rifData, [RBTC]: rbtcData } = useGetBuilderEstimatedRewards({
    builder: builder,
    gauge,
  })

  useHandleErrors({ error: rifData?.error ?? rbtcData?.error, title: 'Error loading estimated rewards' })

  return (
    <RewardCard
      data-testid="estimated-cycle-rewards"
      isLoading={rifData?.isLoading || rbtcData?.isLoading || false}
      title="Estimated this cycle"
      info="Your estimated rewards which will become claimable at the start of the next Cycle."
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

import { useHandleErrors } from '@/app/collective-rewards/utils'
import { useGetBuilderAllTimeRewards } from '@/app/my-rewards/builder/hooks/useGetBuilderAllTimeRewards'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { TokenAmount } from '@/components/TokenAmount'
import { RBTC, RIF } from '@/lib/tokens'
import { Address } from 'viem'

export const TotalEarned = ({ gauge }: { gauge: Address }) => {
  const { rif: rifData, rbtc: rbtcData } = useGetBuilderAllTimeRewards({
    gauge,
  })

  useHandleErrors({ error: rifData.error ?? rbtcData.error, title: 'Error loading total earned' })

  return (
    <RewardCard
      data-testid="total-earned"
      isLoading={rifData.isLoading || rbtcData.isLoading}
      title="Total earned"
      info="Your total rewards earned across all cycles"
      className="flex-row sm:flex-col justify-between w-full sm:w-auto"
    >
      <TokenAmount amount={rifData.amount} tokenSymbol={RIF} amountInFiat={rifData.fiatAmount} />
      <TokenAmount amount={rbtcData.amount} tokenSymbol={RBTC} amountInFiat={rbtcData.fiatAmount} />
    </RewardCard>
  )
}

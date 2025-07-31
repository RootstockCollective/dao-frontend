import { useHandleErrors } from '@/app/utils'
import { TokenAmount } from '@/components/TokenAmount'
import { TokenSymbol } from '@/components/TokenImage'
import { useBackersEstimatedRewards } from '../hooks/useBackersEstimatedRewards'
import { RewardCard } from '../../components/RewardCard'

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
      info={
        <span className="text-[14px] font-normal text-left">
          Estimated rewards for the next Cycle available to Backers.
          <br />
          <br />
          The displayed information is dynamic and may vary based on total rewards and user activity. This
          data is for informational purposes only.
        </span>
      }
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

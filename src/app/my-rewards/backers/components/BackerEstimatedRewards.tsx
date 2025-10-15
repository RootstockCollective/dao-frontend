import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { TokenAmount } from '@/components/TokenAmount'

import { useHandleErrors } from '@/app/collective-rewards/utils'
import { RBTC, RIF } from '@/lib/tokens'
import { useBackerEstimatedRewards } from '../hooks/useBackerEstimatedRewards'

export const BackerEstimatedRewards = () => {
  const { rif: rifData, rbtc: rbtcData } = useBackerEstimatedRewards()
  useHandleErrors({ error: rifData.error ?? rbtcData.error, title: 'Error loading backer estimated rewards' })

  return (
    <RewardCard
      isLoading={rifData.isLoading || rbtcData.isLoading}
      title="Estimated this cycle"
      info={
        <span className="flex flex-col gap-2 text-wrap max-w-[35rem]">
          <span>
            An estimate of the remainder of this Cycle&apos;s rewards that will become fully claimable by the
            end of the current Cycle. These rewards gradually transition into your &apos;Claimable
            Rewards&apos; as the cycle progresses.
          </span>
          <span className="mt-2 mb-2">
            To check the cycle&apos;s completion, go to Collective Rewards → Current Cycle.
          </span>
          <span>
            The displayed information is dynamic and may vary based on total rewards and user activity. This
            data is for informational purposes only.
          </span>
        </span>
      }
      className="flex-row sm:flex-col justify-between w-full sm:w-auto"
    >
      <TokenAmount amount={rifData.amount} tokenSymbol={RIF} amountInFiat={rifData.fiatAmount} />
      <TokenAmount amount={rbtcData.amount} tokenSymbol={RBTC} amountInFiat={rbtcData.fiatAmount} />
    </RewardCard>
  )
}

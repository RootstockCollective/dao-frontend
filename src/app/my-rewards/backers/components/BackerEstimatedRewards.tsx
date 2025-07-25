import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { TokenAmount } from '@/components/TokenAmount'

import { TokenSymbol } from '@/components/TokenImage'
import { useBackerEstimatedRewards } from '../hooks/useBackerEstimatedRewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Paragraph } from '@/components/TypographyNew'

export const BackerEstimatedRewards = () => {
  const { rif: rifData, rbtc: rbtcData } = useBackerEstimatedRewards()
  useHandleErrors({ error: rifData.error ?? rbtcData.error, title: 'Error loading backer estimated rewards' })

  return (
    <RewardCard
      isLoading={rifData.isLoading || rbtcData.isLoading}
      title="Estimated this cycle"
      info={
        <div className="flex flex-col gap-2 text-wrap max-w-[35rem]">
          <Paragraph>
            An estimate of the remainder of this Cycle&apos;s rewards that will become fully claimable by the
            end of the current Cycle. These rewards gradually transition into your &apos;Claimable
            Rewards&apos; as the cycle progresses.
          </Paragraph>
          <Paragraph className="mt-2 mb-2">
            To check the cycle&apos;s completion, go to Collective Rewards → Current Cycle.
          </Paragraph>
          <Paragraph>
            The displayed information is dynamic and may vary based on total rewards and user activity. This
            data is for informational purposes only.
          </Paragraph>
        </div>
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

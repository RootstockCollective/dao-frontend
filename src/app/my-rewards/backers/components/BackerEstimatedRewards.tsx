import { useMemo } from 'react'

import { EstimatedRewardsAmount } from '@/app/collective-rewards/components/EstimatedRewardsAmount'
import { useCycleDistributionStatus } from '@/app/collective-rewards/metrics'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { RewardCard } from '@/app/my-rewards/components/RewardCard'
import { getMetricTokens } from '@/app/shared/utils'
import { usePricesContext } from '@/shared/context'

import { useBackerEstimatedRewards } from '../hooks/useBackerEstimatedRewards'

export const BackerEstimatedRewards = () => {
  const tokens = useBackerEstimatedRewards()
  const { prices } = usePricesContext()
  const { data: distributionStatus, isLoading: isDistributionStatusLoading } = useCycleDistributionStatus()
  useHandleErrors({
    error: tokens.rif.error ?? tokens.rbtc.error ?? tokens.usdrif.error,
    title: 'Error loading backer estimated rewards',
  })

  const { metricTokens, total } = useMemo(
    () =>
      getMetricTokens(
        {
          rif: tokens.rif.amount,
          rbtc: tokens.rbtc.amount,
          usdrif: tokens.usdrif.amount,
        },
        prices,
      ),
    [tokens, prices],
  )

  return (
    <RewardCard
      isLoading={
        tokens.rif.isLoading ||
        tokens.rbtc.isLoading ||
        tokens.usdrif.isLoading ||
        isDistributionStatusLoading
      }
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
      className="flex flex-col justify-between w-full"
    >
      <EstimatedRewardsAmount
        status={distributionStatus}
        fiat={total}
        tokens={metricTokens}
        headerVariant="h3"
        headerWrapperClassName="flex items-center gap-2"
        barClassName="w-full md:max-w-[180px]"
      />
    </RewardCard>
  )
}

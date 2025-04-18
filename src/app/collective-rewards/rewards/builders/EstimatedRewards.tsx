import { useCycleContext } from '@/app/collective-rewards/metrics/context/CycleContext'
import {
  BuilderRewardDetails,
  formatMetrics,
  getBackerRewardPercentage,
  MetricsCard,
  MetricsCardTitle,
  Token,
  TokenMetricsCardRow,
  useGetPerTokenRewards,
  useGetTotalPotentialReward,
} from '@/app/collective-rewards/rewards'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { isBuilderRewardable, useHandleErrors } from '@/app/collective-rewards/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadBuilderRegistry, useReadGauges } from '@/shared/hooks/contracts'
import { FC, useEffect, useMemo, useState } from 'react'
import { Address } from 'viem'

interface TokenRewardsProps {
  builder: Address
  gauge: Address
  currency?: string
  token: Token & { id: 'rif' | 'rbtc' }
}

const TokenRewards: FC<TokenRewardsProps> = ({ builder, gauge, token: { id, symbol }, currency = 'USD' }) => {
  const { [id]: tokenRewards } = useGetPerTokenRewards()
  const [rewards, setRewards] = useState<bigint>(0n)
  const [rewardsError, setRewardsError] = useState<Error | null>(null)
  const [isRewardsLoading, setIsRewardsLoading] = useState(true)

  useEffect(() => {
    if (tokenRewards && tokenRewards.data) {
      setRewards(tokenRewards.data ?? 0n)
    }
    if (tokenRewards && tokenRewards.error) {
      setRewardsError(tokenRewards.error)
    }
    if (tokenRewards) {
      setIsRewardsLoading(tokenRewards.isLoading)
    }
  }, [tokenRewards, symbol])

  const {
    data: totalPotentialRewards,
    isLoading: totalPotentialRewardsLoading,
    error: totalPotentialRewardsError,
  } = useGetTotalPotentialReward()
  const {
    data: rewardShares,
    isLoading: rewardSharesLoading,
    error: rewardSharesError,
  } = useReadGauges({ addresses: [gauge], functionName: 'rewardShares' })
  const {
    data: { cycleNext },
    isLoading: cycleLoading,
    error: cycleError,
  } = useCycleContext()
  const {
    data: rawBackerRewardsPct,
    isLoading: backerRewardsPctLoading,
    error: backerRewardsPctError,
  } = useReadBuilderRegistry({
    functionName: 'backerRewardPercentage',
    args: [builder],
  })

  const backerRewardsPct = useMemo(() => {
    const [previous, next, cooldownEndTime] = rawBackerRewardsPct ?? [0n, 0n, 0n]

    return getBackerRewardPercentage(previous, next, cooldownEndTime, cycleNext.toSeconds())
  }, [rawBackerRewardsPct, cycleNext])

  const rewardPercentageToApply = backerRewardsPct.current

  const { getBuilderByAddress } = useBuilderContext()
  const claimingBuilder = getBuilderByAddress(builder)
  const isRewarded = isBuilderRewardable(claimingBuilder?.stateFlags)

  const error =
    rewardsError ?? totalPotentialRewardsError ?? rewardSharesError ?? backerRewardsPctError ?? cycleError
  useHandleErrors({ error, title: 'Error loading estimated rewards' })

  const { prices } = usePricesContext()

  const rewardsAmount =
    isRewarded && rewardShares[0] && totalPotentialRewards
      ? (rewards * rewardShares[0]) / totalPotentialRewards
      : 0n
  // The complement of the reward percentage is applied to the estimated rewards since are from the builder's perspective
  const estimatedRewards = (rewardsAmount * (WeiPerEther - rewardPercentageToApply)) / WeiPerEther
  const price = prices[symbol]?.price ?? 0
  const { amount, fiatAmount } = formatMetrics(estimatedRewards, price, symbol, currency)

  return withSpinner(
    TokenMetricsCardRow,
    'min-h-0 grow-0',
  )({
    amount,
    fiatAmount,
    isLoading:
      isRewardsLoading ||
      totalPotentialRewardsLoading ||
      rewardSharesLoading ||
      backerRewardsPctLoading ||
      cycleLoading,
  })
}

type EstimatedRewardsProps = BuilderRewardDetails

export const EstimatedRewards: FC<EstimatedRewardsProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Estimated rewards"
        data-testid="EstimatedRewards"
        tooltip={{
          text: (
            <>
              Your estimated rewards which will become claimable at the start of the next Cycle.
              <br />
              <br />
              The displayed information is dynamic and may vary based on total rewards and user activity. This
              data is for informational purposes only.
            </>
          ),
          popoverProps: { size: 'medium' },
        }}
      />
      <TokenRewards {...rest} token={{ ...rif, id: 'rif' }} />
      <TokenRewards {...rest} token={{ ...rbtc, id: 'rbtc' }} />
    </MetricsCard>
  )
}

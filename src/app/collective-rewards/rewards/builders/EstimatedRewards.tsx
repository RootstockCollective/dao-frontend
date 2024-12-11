import {
  formatMetrics,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
  useGetRewardShares,
  useGetTotalPotentialReward,
  useGetPerTokenRewards,
  Token,
  BuilderRewardDetails,
  useGetBackerRewardPercentage,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC, useEffect, useState } from 'react'
import { Address } from 'viem'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { useCycleContext } from '@/app/collective-rewards/metrics/context/CycleContext'

type TokenRewardsProps = {
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
  } = useGetRewardShares(gauge)
  const {
    data: { cycleNext },
    isLoading: cycleLoading,
    error: cycleError,
  } = useCycleContext()
  const {
    data: backerRewardsPct,
    isLoading: backerRewardsPctLoading,
    error: backerRewardsPctError,
  } = useGetBackerRewardPercentage(builder, cycleNext.toSeconds())

  const rewardPercentageToApply = backerRewardsPct?.current ?? 0

  const error =
    rewardsError ?? totalPotentialRewardsError ?? rewardSharesError ?? backerRewardsPctError ?? cycleError
  useHandleErrors({ error, title: 'Error loading estimated rewards' })

  const { prices } = usePricesContext()

  const rewardsAmount =
    rewardShares && totalPotentialRewards ? (rewards * rewardShares) / totalPotentialRewards : 0n
  // The complement of the reward percentage is applied to the estimated rewards since are from the builder's perspective
  const estimatedRewardsInHuman =
    Number(formatBalanceToHuman(rewardsAmount)) * (1 - rewardPercentageToApply / 100)
  const price = prices[symbol]?.price ?? 0
  const { amount, fiatAmount } = formatMetrics(estimatedRewardsInHuman, price, symbol, currency)

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
          text: `Your estimated rewards which will become claimable at the start of the next Cycle. 
          The displayed information is dynamic and may vary based on total rewards and user activity. This data is for informational purposes only.`,
          popoverProps: { size: 'medium' },
        }}
      />
      <TokenRewards {...rest} token={{ ...rif, id: 'rif' }} />
      <TokenRewards {...rest} token={{ ...rbtc, id: 'rbtc' }} />
    </MetricsCard>
  )
}

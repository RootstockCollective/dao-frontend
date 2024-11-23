import {
  formatMetrics,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
  useGetRewardShares,
  useGetTotalPotentialReward,
  useGetPerTokenRewards,
  useGetRewardPercentageToApply,
  Token,
  BuilderRewardDetails,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors, applyPrecision } from '@/app/collective-rewards/utils'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC, useEffect, useState } from 'react'
import { Address } from 'viem'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'

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
    data: rewardPercentage,
    isLoading: rewardPercentageLoading,
    error: rewardPercentageError,
  } = useGetRewardPercentageToApply(builder)

  const error = rewardsError ?? totalPotentialRewardsError ?? rewardSharesError ?? rewardPercentageError
  useHandleErrors({ error, title: 'Error loading estimated rewards' })

  const { prices } = usePricesContext()

  const rewardsAmount =
    rewardShares && totalPotentialRewards ? rewards * (rewardShares / totalPotentialRewards) : 0n
  const estimatedRewards = rewardPercentage ? applyPrecision(rewardsAmount * rewardPercentage) : 0n
  const estimatedRewardsInHuman = Number(formatBalanceToHuman(estimatedRewards))
  const price = prices[symbol]?.price ?? 0
  const { amount, fiatAmount } = formatMetrics(estimatedRewardsInHuman, price, symbol, currency)

  return withSpinner(
    TokenMetricsCardRow,
    'min-h-0 grow-0',
  )({
    amount,
    fiatAmount,
    isLoading:
      isRewardsLoading || totalPotentialRewardsLoading || rewardSharesLoading || rewardPercentageLoading,
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
          text: 'The information displayed is dynamic and may vary based on total rewards available and user activity. This data is provided for informational purposes only. Please note that the final reward amount will be determined at the end of the cycle.',
          popoverProps: { size: 'medium' },
        }}
      />
      <TokenRewards {...rest} token={{ ...rif, id: 'rif' }} />
      <TokenRewards {...rest} token={{ ...rbtc, id: 'rbtc' }} />
    </MetricsCard>
  )
}

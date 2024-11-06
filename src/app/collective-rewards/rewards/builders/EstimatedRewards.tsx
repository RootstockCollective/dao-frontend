import {
  formatMetrics,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
  useGetRewardShares,
  useGetTotalPotentialReward,
  useGetPerTokenRewards,
  useGetRewardPercentageToApply,
  RewardDetails,
  Token,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC, useEffect, useState } from 'react'
import { Address, parseUnits } from 'viem'
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

  const precision = parseUnits('1', 18)
  const rewardsAmount = rewardPercentage ? (rewards * rewardPercentage) / precision : 0n

  const estimatedRewards =
    rewardShares && totalPotentialRewards ? (rewardShares * rewardsAmount) / totalPotentialRewards : 0n
  const estimatedRewardsInHuman = Number(formatBalanceToHuman(estimatedRewards))
  const price = prices[symbol]?.price ?? 0
  const { amount, fiatAmount } = formatMetrics(estimatedRewardsInHuman, price, symbol, currency)

  return withSpinner(TokenMetricsCardRow)({
    amount,
    fiatAmount,
    isLoading:
      isRewardsLoading || totalPotentialRewardsLoading || rewardSharesLoading || rewardPercentageLoading,
  })
}

type EstimatedRewardsProps = RewardDetails

export const EstimatedRewards: FC<EstimatedRewardsProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle title="Estimated rewards" data-testid="EstimatedRewards" />
      <TokenRewards {...rest} token={{ ...rif, id: 'rif' }} />
      <TokenRewards {...rest} token={{ ...rbtc, id: 'rbtc' }} />
    </MetricsCard>
  )
}

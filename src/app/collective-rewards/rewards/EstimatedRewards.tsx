import {
  formatMetrics,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
  useGetRewardShares,
  useGetTotalPotentialReward,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC, useEffect, useState } from 'react'
import { Address } from 'viem'
import { useGetPerTokenRewards } from './hooks/useGetPerTokenRewards'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'

type Token = {
  symbol: string
  address: Address
}

type TokenRewardsProps = {
  gauge: Address
  currency?: string
  token: Token & { id: 'rif' | 'rbtc' }
}

const TokenRewards: FC<TokenRewardsProps> = ({ gauge, token: { id, symbol }, currency = 'USD' }) => {
  const { [id]: tokenRewards } = useGetPerTokenRewards()
  const [rewards, setRewards] = useState<bigint>(0n)
  const [rewardsError, setRewardsError] = useState<Error | null>(null)
  const [isRewardsLoading, setIsRewardsLoading] = useState(true)

  useEffect(() => {
    if (tokenRewards && symbol in tokenRewards) {
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

  const error = rewardsError ?? totalPotentialRewardsError ?? rewardSharesError
  useHandleErrors({ error, title: 'Error loading estimated rewards' })

  const { prices } = usePricesContext()

  const estimatedRewards =
    rewards && rewardShares && totalPotentialRewards ? (rewards * rewardShares) / totalPotentialRewards : 0n
  const estimatedRewardsInHuman = Number(formatBalanceToHuman(estimatedRewards))
  const price = prices[symbol]?.price ?? 0
  const { amount, fiatAmount } = formatMetrics(estimatedRewardsInHuman, price, symbol, currency)

  return withSpinner(TokenMetricsCardRow)({
    amount,
    fiatAmount,
    isLoading: isRewardsLoading || totalPotentialRewardsLoading || rewardSharesLoading,
  })
}

type EstimatedRewardsProps = {
  gauge: Address
  currency?: string
  data: {
    [token: string]: Token
  }
}

export const EstimatedRewards: FC<EstimatedRewardsProps> = ({ data: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle title="Estimated rewards" data-testid="EstimatedRewards" />
      <TokenRewards {...rest} token={{ ...rif, id: 'rif' }} />
      <TokenRewards {...rest} token={{ ...rbtc, id: 'rbtc' }} />
    </MetricsCard>
  )
}

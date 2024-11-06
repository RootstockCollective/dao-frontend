import {
  formatMetrics,
  MetricsCardTitle,
  MetricsCard,
  TokenMetricsCardRow,
  Token,
  RewardDetails,
  useBackerRewardsContext,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC } from 'react'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'

export const rewardTypes = ['earned', 'claimed', 'estimated'] as const
export type Rewards = (typeof rewardTypes)[number]

type TokenRewardsMetricsProps = {
  rewards: Rewards[]
  currency?: string
  token: Token
}

const TokenRewardsMetrics: FC<TokenRewardsMetricsProps> = ({
  token: { symbol, address },
  currency = 'USD',
  rewards,
}) => {
  const { data, isLoading, error } = useBackerRewardsContext()
  const { earned, claimed, estimated } = data[address]

  const calculateTotalRewards = (rewardType: Rewards) => {
    switch (rewardType) {
      case 'earned':
        return Object.values(earned).reduce((acc, value) => acc + value, 0n)
      case 'claimed':
        return Object.values(claimed).reduce(
          (acc, value) => acc + value.reduce((acc, value) => acc + value.args.amount_, 0n),
          0n,
        )
      case 'estimated':
        return Object.values(estimated).reduce((acc, value) => acc + value, 0n)
      default:
        return 0n
    }
  }

  const totalRewards = rewards.reduce((acc, rewardType) => acc + calculateTotalRewards(rewardType), 0n)

  useHandleErrors({ error: error, title: 'Error loading all time rewards' })

  const { prices } = usePricesContext()

  const totalRewardsInHuman = Number(formatBalanceToHuman(totalRewards))
  const price = prices[symbol]?.price ?? 0

  const { amount, fiatAmount } = formatMetrics(totalRewardsInHuman, price, symbol, currency)

  return withSpinner(TokenMetricsCardRow)({
    amount,
    fiatAmount,
    isLoading,
  })
}

type RewardsCardProps = Omit<RewardDetails, 'gauge'> & {
  title: string
  'data-testid': string
  rewards: Rewards[]
}

export const RewardsCard: FC<RewardsCardProps> = ({
  title,
  'data-testid': dataTestId,
  tokens: { rif, rbtc },
  ...rest
}) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle title={title} data-testid={dataTestId} />
      <TokenRewardsMetrics {...rest} token={rif} />
      <TokenRewardsMetrics {...rest} token={rbtc} />
    </MetricsCard>
  )
}

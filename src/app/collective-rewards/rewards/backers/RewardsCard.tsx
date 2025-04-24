import {
  formatMetrics,
  MetricsCard,
  MetricsCardProps,
  MetricsCardTitle,
  MetricsCardTitleProps,
  RewardDetails,
  Token,
  TokenMetricsCardRow,
  useBackerRewardsContext,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC } from 'react'

export const rewardTypes = ['earned', 'claimed', 'estimated'] as const
export type Rewards = (typeof rewardTypes)[number]

type TokenRewardsMetricsProps = {
  rewards: Rewards[]
  currency?: string
  token: Token
}

export const TokenRewardsMetrics: FC<TokenRewardsMetricsProps> = ({
  token: { symbol, address },
  currency = 'USD',
  rewards,
}) => {
  const { data, isLoading, error } = useBackerRewardsContext()
  const { earned, claimed, estimated } = data[address]

  const calculateTotalRewards = {
    earned: Object.values(earned).reduce((acc, earned) => acc + earned, 0n),
    claimed: Object.values(claimed).reduce(
      (acc, value) => acc + value.reduce((acc, value) => acc + value.args.amount_, 0n),
      0n,
    ),
    estimated: Object.values(estimated).reduce((acc, estimated) => acc + estimated, 0n),
  }

  const totalRewards = rewards.reduce((acc, rewardType) => acc + calculateTotalRewards[rewardType], 0n)

  useHandleErrors({ error: error, title: 'Error loading all time rewards' })

  const { prices } = usePricesContext()
  const price = prices[symbol]?.price ?? 0

  const { amount, fiatAmount } = formatMetrics(totalRewards, price, symbol, currency)

  return withSpinner(TokenMetricsCardRow, {
    className: 'min-h-0 grow-0',
    size: 'small',
  })({
    amount,
    fiatAmount,
    isLoading,
  })
}

export type RewardsCardProps = MetricsCardProps & {
  rewardDetails: Omit<RewardDetails, 'gauges' | 'builder'> & {
    rewards: Rewards[]
  }
  titleDetails: MetricsCardTitleProps
}

export const RewardsCard: FC<RewardsCardProps> = ({
  rewardDetails: {
    tokens: { rif, rbtc },
    ...restOfRewardDetails
  },
  titleDetails,
  dataTestId,
  ...rest
}) => {
  return (
    <MetricsCard borderless dataTestId={dataTestId} {...rest}>
      <MetricsCardTitle data-testid={dataTestId} {...titleDetails} />
      <TokenRewardsMetrics {...restOfRewardDetails} token={rif} />
      <TokenRewardsMetrics {...restOfRewardDetails} token={rbtc} />
    </MetricsCard>
  )
}

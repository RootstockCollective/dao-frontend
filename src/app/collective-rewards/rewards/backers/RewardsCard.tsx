import {
  formatMetrics,
  MetricsCardTitle,
  MetricsCard,
  TokenMetricsCardRow,
  Token,
  RewardDetails,
  useBackerRewardsContext,
  TooltipProps,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
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

  return withSpinner(
    TokenMetricsCardRow,
    'min-h-0 grow-0',
  )({
    amount,
    fiatAmount,
    isLoading,
  })
}

type RewardsCardProps = Omit<RewardDetails, 'gauge'> & {
  title: string
  'data-testid': string
  rewards: Rewards[]
  tooltip?: TooltipProps
}

export const RewardsCard: FC<RewardsCardProps> = ({
  title,
  'data-testid': dataTestId,
  tokens: { rif, rbtc },
  tooltip,
  ...rest
}) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle title={title} data-testid={dataTestId} tooltip={tooltip} />
      <TokenRewardsMetrics {...rest} token={rif} />
      <TokenRewardsMetrics {...rest} token={rbtc} />
    </MetricsCard>
  )
}

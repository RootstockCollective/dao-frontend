import {
  ClaimYourRewardsButton,
  formatMetrics,
  MetricsCard,
  MetricsCardProps,
  MetricsCardTitle,
  RewardDetails,
  Token,
  TokenMetricsCardRow,
  useBackerRewardsContext,
  useClaimBackerRewards,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC } from 'react'

type TokenRewardsMetricsProps = {
  token: Token
  currency?: string
}

const TokenRewardsMetrics: FC<TokenRewardsMetricsProps> = ({
  token: { address, symbol },
  currency = 'USD',
}) => {
  const { prices } = usePricesContext()
  const { data, isLoading, error } = useBackerRewardsContext()
  const { earned } = data[address]
  const earnedRewards = Object.values(earned).reduce((acc, earned) => acc + earned, 0n)
  useHandleErrors({ error, title: 'Error loading rewards' })

  const tokenPrice = prices[symbol]?.price ?? 0

  const { amount, fiatAmount } = formatMetrics(earnedRewards, tokenPrice, symbol, currency)

  const { claimRewards, isClaimable } = useClaimBackerRewards(address)

  return withSpinner(TokenMetricsCardRow, { size: 'small' })({
    amount,
    fiatAmount,
    symbol,
    isLoading,
    children: <ClaimYourRewardsButton onClick={() => claimRewards()} disabled={!isClaimable} />,
  })
}

// FIXME: change type to match the domain (backer not builder rewards)
type ClaimableRewardsProps = MetricsCardProps & {
  tokenRewardsMetrics: Omit<RewardDetails, 'gauges' | 'builder'>
}

export const ClaimableRewards: FC<ClaimableRewardsProps> = ({
  tokenRewardsMetrics: {
    tokens: { rif, rbtc },
    ...restOfTokenRewardsMetrics
  },
  ...rest
}) => {
  return (
    <MetricsCard borderless {...rest}>
      <MetricsCardTitle
        title="Claimable rewards"
        data-testid="ClaimableRewards"
        tooltip={{ text: 'Your rewards available to claim' }}
      />
      <TokenRewardsMetrics {...restOfTokenRewardsMetrics} token={rif} />
      <TokenRewardsMetrics {...restOfTokenRewardsMetrics} token={rbtc} />
    </MetricsCard>
  )
}

import { FC } from 'react'
import { Address } from 'viem'
import { usePricesContext } from '@/shared/context/PricesContext'
import {
  formatMetrics,
  MetricsCard,
  TokenMetricsCardRow,
  MetricsCardTitle,
  useClaimBackerRewards,
  RewardDetails,
  Token,
  useBackerRewardsContext,
  ClaimYourRewardsButton,
} from '@/app/collective-rewards/rewards'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'

type TokenRewardsMetricsProps = {
  gauges: Address[]
  token: Token
  currency?: string
}

const TokenRewardsMetrics: FC<TokenRewardsMetricsProps> = ({
  gauges,
  token: { address, symbol },
  currency = 'USD',
}) => {
  const { prices } = usePricesContext()
  const { data, isLoading, error } = useBackerRewardsContext()
  const { earned } = data[address]
  const earnedRewards = Object.values(earned).reduce((acc, earned) => acc + earned, 0n)
  useHandleErrors({ error, title: 'Error loading rewards' })

  const tokenPrice = prices[symbol]?.price ?? 0

  const { amount, fiatAmount } = formatMetrics(
    Number(formatBalanceToHuman(earnedRewards)),
    tokenPrice,
    symbol,
    currency,
  )

  const { claimRewards } = useClaimBackerRewards(gauges)

  return withSpinner(TokenMetricsCardRow)({
    amount,
    fiatAmount,
    isLoading,
    children: <ClaimYourRewardsButton onClick={() => claimRewards(address)} />,
  })
}

type ClaimableRewardsProps = Omit<RewardDetails, 'gauge'>

export const ClaimableRewards: FC<ClaimableRewardsProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle title="Claimable rewards" data-testid="ClaimableRewards" />
      <TokenRewardsMetrics {...rest} token={rif} />
      <TokenRewardsMetrics {...rest} token={rbtc} />
    </MetricsCard>
  )
}

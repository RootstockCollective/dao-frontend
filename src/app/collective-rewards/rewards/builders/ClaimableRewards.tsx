import {
  formatMetrics,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
  useClaimBuilderRewards,
  useGetBuilderRewards,
  Token,
  ClaimYourRewardsButton,
  BuilderRewardDetails,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC } from 'react'
import { Address } from 'viem'

type TokenRewardsMetricsProps = {
  builder: Address
  gauge: Address
  token: Token
  currency?: string
}

const TokenRewardsMetrics: FC<TokenRewardsMetricsProps> = ({
  gauge,
  token: { address, symbol },
  currency = 'USD',
}) => {
  const { prices } = usePricesContext()

  const {
    data: rewards,
    isLoading: rewardsLoading,
    error: rewardsError,
  } = useGetBuilderRewards(address, gauge)
  useHandleErrors({ error: rewardsError, title: 'Error loading rewards' })

  const tokenPrice = prices[symbol]?.price ?? 0

  const { amount, fiatAmount } = formatMetrics(
    Number(formatBalanceToHuman(rewards ?? 0n)),
    tokenPrice,
    symbol,
    currency,
  )

  const { isClaimable, claimRewards } = useClaimBuilderRewards(gauge, address)

  return withSpinner(
    TokenMetricsCardRow,
    'min-h-0 grow-0',
  )({
    amount,
    fiatAmount,
    isLoading: rewardsLoading,
    children: <ClaimYourRewardsButton onClick={() => claimRewards(address)} disabled={!isClaimable} />,
  })
}

type ClaimableRewardsProps = BuilderRewardDetails

export const ClaimableRewards: FC<ClaimableRewardsProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle title="Claimable rewards" data-testid="ClaimableRewards" />
      <TokenRewardsMetrics {...rest} token={rif} />
      <TokenRewardsMetrics {...rest} token={rbtc} />
    </MetricsCard>
  )
}

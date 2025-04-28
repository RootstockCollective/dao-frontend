import {
  BuilderRewardDetails,
  ClaimYourRewardsButton,
  formatMetrics,
  MetricsCard,
  MetricsCardTitle,
  Token,
  TokenMetricsCardRow,
  useClaimBuilderRewardsPerToken,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useReadGauge } from '@/shared/hooks/contracts/collective-rewards/useReadGauge'
import { FC } from 'react'
import { Address } from 'viem'

type TokenRewardsMetricsProps = {
  builder: Address
  gauge: Address
  token: Token
  currency?: string
}

const TokenRewardsMetrics: FC<TokenRewardsMetricsProps> = ({
  builder,
  gauge,
  token: { address, symbol },
  currency = 'USD',
}) => {
  const { prices } = usePricesContext()

  const {
    data: rewards,
    isLoading: rewardsLoading,
    error: rewardsError,
  } = useReadGauge({ address: gauge, functionName: 'builderRewards', args: [address] })
  useHandleErrors({ error: rewardsError, title: 'Error loading rewards' })

  const tokenPrice = prices[symbol]?.price ?? 0

  const { amount, fiatAmount } = formatMetrics(rewards ?? 0n, tokenPrice, symbol, currency)

  const { isClaimable, claimRewards, isPaused } = useClaimBuilderRewardsPerToken(builder, gauge, address)
  const content = isPaused ? 'You cannot be paused to claim rewards' : undefined

  return withSpinner(TokenMetricsCardRow, { className: 'min-h-0 grow-0', size: 'small' })({
    amount,
    fiatAmount,
    isLoading: rewardsLoading,
    children: (
      <ClaimYourRewardsButton
        onClick={() => claimRewards()}
        disabled={!isClaimable || isPaused}
        content={content}
      />
    ),
  })
}

type ClaimableRewardsProps = BuilderRewardDetails

export const ClaimableRewards: FC<ClaimableRewardsProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Claimable rewards"
        data-testid="ClaimableRewards"
        tooltip={{ text: 'Your rewards available to claim' }}
      />
      <TokenRewardsMetrics {...rest} token={rif} />
      <TokenRewardsMetrics {...rest} token={rbtc} />
    </MetricsCard>
  )
}

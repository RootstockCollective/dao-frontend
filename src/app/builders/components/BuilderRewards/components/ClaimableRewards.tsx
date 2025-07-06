import {
  BuilderRewardDetails,
  ClaimYourRewardsButton,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRowV2,
} from '@/app/collective-rewards/rewards'
import { FC } from 'react'

type ClaimableRewardsProps = BuilderRewardDetails

export const ClaimableRewards: FC<ClaimableRewardsProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Claimable rewards"
        data-testid="ClaimableRewards"
        tooltip={{ text: 'Your rewards available to claim' }}
      />
      <TokenMetricsCardRowV2
        amount="1,234.56"
        fiatAmount="$2,469.12"
        symbol={rif.symbol}
      >
        <ClaimYourRewardsButton
          onClick={() => alert('Claim RIF rewards (mock)')}
          disabled={false}
        />
      </TokenMetricsCardRowV2>
      <TokenMetricsCardRowV2
        amount="0.85"
        fiatAmount="$1,700.00"
        symbol={rbtc.symbol}
      >
        <ClaimYourRewardsButton
          onClick={() => alert('Claim rBTC rewards (mock)')}
          disabled={false}
        />
      </TokenMetricsCardRowV2>
    </MetricsCard>
  )
} 
import {
  BuilderRewardDetails,
  ClaimYourRewardsButton,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
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
      <TokenMetricsCardRow
        amount="1,234.56"
        fiatAmount="$2,469.12"
      >
        <ClaimYourRewardsButton
          onClick={() => alert('Claim RIF rewards (mock)')}
          disabled={false}
        />
      </TokenMetricsCardRow>
      <TokenMetricsCardRow
        amount="0.85"
        fiatAmount="$1,700.00"
      >
        <ClaimYourRewardsButton
          onClick={() => alert('Claim rBTC rewards (mock)')}
          disabled={false}
        />
      </TokenMetricsCardRow>
    </MetricsCard>
  )
} 
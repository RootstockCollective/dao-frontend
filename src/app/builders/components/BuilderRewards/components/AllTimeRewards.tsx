import {
  BuilderRewardDetails,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
} from '@/app/collective-rewards/rewards'
import { FC } from 'react'

type AllTimeRewardsProps = Omit<BuilderRewardDetails, 'builder'>

export const AllTimeRewards: FC<AllTimeRewardsProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Total earned"
        data-testid="AllTimeRewards"
        tooltip={{ text: 'Your total rewards earned across all cycles' }}
      />
      <TokenMetricsCardRow amount="12,345.67" fiatAmount="$24,691.34" />
      <TokenMetricsCardRow amount="8.75" fiatAmount="$17,500.00" />
    </MetricsCard>
  )
}

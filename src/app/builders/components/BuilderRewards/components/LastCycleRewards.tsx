import {
  BuilderRewardDetails,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
} from '@/app/collective-rewards/rewards'
import { FC } from 'react'

type LastCycleRewardsProps = Omit<BuilderRewardDetails, 'builder'>

export const LastCycleRewards: FC<LastCycleRewardsProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Last cycle rewards"
        data-testid="LastCycleRewards"
        tooltip={{ text: 'Your rewards from the previous cycle' }}
      />
      <TokenMetricsCardRow amount="890.12" fiatAmount="1,780.24 USD" />
      <TokenMetricsCardRow amount="0.65" fiatAmount="1,300.00 USD" />
    </MetricsCard>
  )
}

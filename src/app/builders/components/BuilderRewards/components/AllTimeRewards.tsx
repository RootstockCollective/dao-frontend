import {
  BuilderRewardDetails,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRowV2,
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
      <TokenMetricsCardRowV2 amount="12,345.67" fiatAmount="24,691.34 USD" symbol={rif.symbol} />
      <TokenMetricsCardRowV2 amount="8.75" fiatAmount="17,500.00 USD" symbol={rbtc.symbol} />
    </MetricsCard>
  )
}

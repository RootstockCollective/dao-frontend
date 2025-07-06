import {
  BuilderRewardDetails,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRowV2,
} from '@/app/collective-rewards/rewards'
import { FC } from 'react'

type UnclaimedProps = BuilderRewardDetails

export const Unclaimed: FC<UnclaimedProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Unclaimed"
        data-testid="Unclaimed"
        tooltip={{ text: 'Your rewards available to claim' }}
      />
      <TokenMetricsCardRowV2 amount="1,234.56" fiatAmount="2,469.12 USD" symbol={rif.symbol} />
      <TokenMetricsCardRowV2 amount="0.85" fiatAmount="1,700.00 USD" symbol={rbtc.symbol} />
    </MetricsCard>
  )
}

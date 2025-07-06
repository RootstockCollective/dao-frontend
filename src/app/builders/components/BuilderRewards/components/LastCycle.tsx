import {
  BuilderRewardDetails,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRowV2,
} from '@/app/collective-rewards/rewards'
import { FC } from 'react'

type LastCycleProps = Omit<BuilderRewardDetails, 'builder'>

export const LastCycle: FC<LastCycleProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Last cycle"
        data-testid="LastCycle"
        tooltip={{ text: 'Your rewards from the previous cycle' }}
      />
      <TokenMetricsCardRowV2 amount="890.12" fiatAmount="1,780.24 USD" symbol={rif.symbol} />
      <TokenMetricsCardRowV2 amount="0.65" fiatAmount="1,300.00 USD" symbol={rbtc.symbol} />
    </MetricsCard>
  )
}

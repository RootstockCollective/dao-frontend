import {
  BuilderRewardDetails,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
} from '@/app/collective-rewards/rewards'
import { FC } from 'react'

type EstimatedRewardsProps = BuilderRewardDetails

export const EstimatedRewards: FC<EstimatedRewardsProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Estimated rewards"
        data-testid="EstimatedRewards"
        tooltip={{
          text: (
            <>
              Your estimated rewards which will become claimable at the start of the next Cycle.
              <br />
              <br />
              The displayed information is dynamic and may vary based on total rewards and user activity. This
              data is for informational purposes only.
            </>
          ),
          popoverProps: { size: 'medium' },
        }}
      />
      <TokenMetricsCardRow
        amount="567.89"
        fiatAmount="$1,135.78"
      />
      <TokenMetricsCardRow
        amount="0.42"
        fiatAmount="$840.00"
      />
    </MetricsCard>
  )
} 
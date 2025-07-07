import {
  BuilderRewardDetails,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRowV2,
} from '@/app/collective-rewards/rewards'
import { useBuilderEstimatedRewards } from '../hooks'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { FC } from 'react'

type EstimatedThisCycleProps = BuilderRewardDetails & { isMock?: boolean }

const EstimatedThisCycleContent: FC<BuilderRewardDetails> = ({ tokens: { rif, rbtc }, ...props }) => {
  const { rif: rifData, rbtc: rbtcData } = useBuilderEstimatedRewards({
    ...props,
    tokens: { rif, rbtc },
  })

  const RifRow = withSpinner(TokenMetricsCardRowV2, { size: 'small' })
  const RbtcRow = withSpinner(TokenMetricsCardRowV2, { size: 'small' })

  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Estimated this cycle"
        data-testid="EstimatedThisCycle"
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
      <RifRow
        amount={rifData.amount}
        fiatAmount={rifData.fiatAmount}
        symbol={rif.symbol}
        isLoading={rifData.isLoading}
      />
      <RbtcRow
        amount={rbtcData.amount}
        fiatAmount={rbtcData.fiatAmount}
        symbol={rbtc.symbol}
        isLoading={rbtcData.isLoading}
      />
    </MetricsCard>
  )
}

export const EstimatedThisCycle: FC<EstimatedThisCycleProps> = ({
  isMock = false,
  tokens: { rif, rbtc },
  ...props
}) => {
  if (isMock) {
    return (
      <MetricsCard borderless>
        <MetricsCardTitle
          title="Estimated this cycle"
          data-testid="EstimatedThisCycle"
          tooltip={{
            text: (
              <>
                Your estimated rewards which will become claimable at the start of the next Cycle.
                <br />
                <br />
                The displayed information is dynamic and may vary based on total rewards and user activity.
                This data is for informational purposes only.
              </>
            ),
            popoverProps: { size: 'medium' },
          }}
        />
        <TokenMetricsCardRowV2 amount="567.89" fiatAmount="1,135.78 USD" symbol={rif.symbol} />
        <TokenMetricsCardRowV2 amount="0.42" fiatAmount="840.00 USD" symbol={rbtc.symbol} />
      </MetricsCard>
    )
  }

  return <EstimatedThisCycleContent tokens={{ rif, rbtc }} {...props} />
}

import {
  BuilderRewardDetails,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRowV2,
} from '@/app/collective-rewards/rewards'
import { useBuilderAllTimeRewards } from '../hooks'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { FC } from 'react'

type AllTimeRewardsProps = Omit<BuilderRewardDetails, 'builder'> & { isMock?: boolean }

const AllTimeRewardsContent: FC<Omit<BuilderRewardDetails, 'builder'>> = ({
  tokens: { rif, rbtc },
  ...props
}) => {
  const { rif: rifData, rbtc: rbtcData } = useBuilderAllTimeRewards({
    ...props,
    tokens: { rif, rbtc },
  })

  const RifRow = withSpinner(TokenMetricsCardRowV2, { size: 'small' })
  const RbtcRow = withSpinner(TokenMetricsCardRowV2, { size: 'small' })

  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Total earned"
        data-testid="AllTimeRewards"
        tooltip={{ text: 'Your total rewards earned across all cycles' }}
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

export const AllTimeRewards: FC<AllTimeRewardsProps> = ({
  isMock = false,
  tokens: { rif, rbtc },
  ...props
}) => {
  if (isMock) {
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

  return <AllTimeRewardsContent tokens={{ rif, rbtc }} {...props} />
}

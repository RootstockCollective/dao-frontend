import {
  BuilderRewardDetails,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
} from '@/app/collective-rewards/rewards'
import { useBuilderLastCycleRewards } from '../hooks'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { FC } from 'react'

type LastCycleProps = Omit<BuilderRewardDetails, 'builder'> & { isMock?: boolean }

const LastCycleContent: FC<Omit<BuilderRewardDetails, 'builder'>> = ({ tokens: { rif, rbtc }, ...props }) => {
  const { rif: rifData, rbtc: rbtcData } = useBuilderLastCycleRewards({
    ...props,
    tokens: { rif, rbtc },
  })

  const RifRow = withSpinner(TokenMetricsCardRow, { size: 'small' })
  const RbtcRow = withSpinner(TokenMetricsCardRow, { size: 'small' })

  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Last cycle"
        data-testid="LastCycle"
        tooltip={{ text: 'Your rewards from the previous cycle' }}
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

export const LastCycle: FC<LastCycleProps> = ({ isMock = false, tokens: { rif, rbtc }, ...props }) => {
  if (isMock) {
    return (
      <MetricsCard borderless>
        <MetricsCardTitle
          title="Last cycle"
          data-testid="LastCycle"
          tooltip={{ text: 'Your rewards from the previous cycle' }}
        />
        <TokenMetricsCardRow amount="890.12" fiatAmount="1,780.24 USD" symbol={rif.symbol} />
        <TokenMetricsCardRow amount="0.65" fiatAmount="1,300.00 USD" symbol={rbtc.symbol} />
      </MetricsCard>
    )
  }

  return <LastCycleContent tokens={{ rif, rbtc }} {...props} />
}

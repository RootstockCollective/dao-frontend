import {
  BuilderRewardDetails,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRowV2,
} from '@/app/collective-rewards/rewards'
import { useBuilderUnclaimedRewards } from '../hooks'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { FC } from 'react'

type UnclaimedProps = BuilderRewardDetails & { isMock?: boolean }

const UnclaimedContent: FC<BuilderRewardDetails> = ({ tokens: { rif, rbtc }, ...props }) => {
  const { rif: rifData, rbtc: rbtcData } = useBuilderUnclaimedRewards({
    ...props,
    tokens: { rif, rbtc },
  })

  const RifRow = withSpinner(TokenMetricsCardRowV2, { size: 'small' })
  const RbtcRow = withSpinner(TokenMetricsCardRowV2, { size: 'small' })

  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="Unclaimed"
        data-testid="Unclaimed"
        tooltip={{ text: 'Your rewards available to claim' }}
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

export const Unclaimed: FC<UnclaimedProps> = ({ isMock = false, tokens: { rif, rbtc }, ...props }) => {
  if (isMock) {
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

  return <UnclaimedContent tokens={{ rif, rbtc }} {...props} />
}

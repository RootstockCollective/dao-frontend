import { Address } from 'viem'
import {
  MetricsCard,
  MetricsCardTitle,
  useGetGaugesNotifyReward,
  Token,
  TokenMetricsCardRow,
  formatMetrics,
} from '@/app/collective-rewards/rewards'
import { FC } from 'react'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { usePricesContext } from '@/shared/context/PricesContext'

type TokenRewardsMetricsProps = {
  gauges: Address[]
  currency?: string
  token: Token
}

const TokenRewardsMetrics: FC<TokenRewardsMetricsProps> = ({
  gauges,
  token: { symbol, address },
  currency = 'USD',
}) => {
  const { data, isLoading, error } = useGetGaugesNotifyReward(gauges, address)

  useHandleErrors({ error, title: 'Error loading all time rewards' })

  const { prices } = usePricesContext()

  const totalRewards = Object.values(data).reduce(
    (acc, events) =>
      acc +
      events.reduce(
        (acc, { args: { backersAmount_, builderAmount_ } }) => acc + backersAmount_ + builderAmount_,
        0n,
      ),
    0n,
  )

  const price = prices[symbol]?.price ?? 0
  const { amount, fiatAmount } = formatMetrics(totalRewards, price, symbol, currency)

  return withSpinner(TokenMetricsCardRow, 'min-h-0 grow-0', {
    size: 8,
  })({
    amount,
    fiatAmount,
    isLoading,
  })
}

type AllTimeRewardsProps = {
  gauges: Address[]
  tokens: {
    [token: string]: Token
  }
}

export const AllTimeRewardsMetrics: FC<AllTimeRewardsProps> = ({ gauges, tokens: { rif, rbtc } }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle
        title="All time rewards"
        data-testid="AllTimeRewards"
        tooltip={{
          text: 'Total rewards distributed to Builders and Backers',
        }}
      />
      <TokenRewardsMetrics gauges={gauges} token={rif} />
      <TokenRewardsMetrics gauges={gauges} token={rbtc} />
    </MetricsCard>
  )
}

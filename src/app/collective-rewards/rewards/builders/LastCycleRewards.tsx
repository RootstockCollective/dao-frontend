import { useCycleContext } from '@/app/collective-rewards/metrics/context/CycleContext'
import {
  formatMetrics,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
  useGetGaugeNotifyRewardLogs,
  Token,
  BuilderRewardDetails,
  getNotifyRewardAmount,
  useGetLastCycleDistribution,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC } from 'react'
import { Address } from 'viem'

type TokenRewardsMetricsProps = {
  gauge: Address
  currency?: string
  token: Token
}

const TokenRewardsMetrics: FC<TokenRewardsMetricsProps> = ({
  gauge,
  token: { symbol, address },
  currency = 'USD',
}) => {
  const { data: cycle, isLoading: cycleLoading, error: cycleError } = useCycleContext()
  const {
    data: { fromTimestamp, toTimestamp },
    isLoading: lastCycleRewardsLoading,
    error: lastCycleRewardsError,
  } = useGetLastCycleDistribution(cycle)

  const {
    data: rewardsPerToken,
    isLoading: logsLoading,
    error: rewardsError,
  } = useGetGaugeNotifyRewardLogs(gauge, address, fromTimestamp, toTimestamp)

  const error = cycleError ?? lastCycleRewardsError ?? rewardsError
  useHandleErrors({ error, title: 'Error loading last cycle rewards' })

  const { prices } = usePricesContext()

  const lastCycleRewards = getNotifyRewardAmount(rewardsPerToken, address, 'builderAmount_')
  const price = prices[symbol]?.price ?? 0
  const { amount, fiatAmount } = formatMetrics(lastCycleRewards[address] ?? 0n, price, symbol, currency)

  return withSpinner(TokenMetricsCardRow, { className: 'min-h-0 grow-0', size: 'small' })({
    amount,
    fiatAmount,
    isLoading: cycleLoading || lastCycleRewardsLoading || logsLoading,
  })
}

type LastCycleRewardsProps = Omit<BuilderRewardDetails, 'builder'>

export const LastCycleRewards: FC<LastCycleRewardsProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle title="Last cycle rewards" data-testid="LastCycleRewards" />
      <TokenRewardsMetrics {...rest} token={rif} />
      <TokenRewardsMetrics {...rest} token={rbtc} />
    </MetricsCard>
  )
}

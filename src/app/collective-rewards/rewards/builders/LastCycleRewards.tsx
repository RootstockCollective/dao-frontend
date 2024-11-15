import { useCycleContext } from '@/app/collective-rewards/metrics/context/CycleContext'
import {
  formatMetrics,
  getLastCycleRewards,
  MetricsCard,
  MetricsCardTitle,
  TokenMetricsCardRow,
  useGetGaugeNotifyRewardLogs,
  RewardDetails,
  Token,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
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
    data: rewardsPerToken,
    isLoading: logsLoading,
    error: rewardsError,
  } = useGetGaugeNotifyRewardLogs(gauge)

  const error = cycleError ?? rewardsError
  useHandleErrors({ error, title: 'Error loading last cycle rewards' })

  const { prices } = usePricesContext()

  const lastCycleRewards = getLastCycleRewards(cycle, rewardsPerToken[address])
  const lastCycleRewardsInHuman = Number(formatBalanceToHuman(lastCycleRewards.builderAmount))
  const price = prices[symbol]?.price ?? 0
  const { amount, fiatAmount } = formatMetrics(lastCycleRewardsInHuman, price, symbol, currency)

  return withSpinner(
    TokenMetricsCardRow,
    'min-h-0 grow-0',
  )({
    amount,
    fiatAmount,
    isLoading: cycleLoading || logsLoading,
  })
}

type LastCycleRewardsProps = Omit<RewardDetails, 'builder'>

export const LastCycleRewards: FC<LastCycleRewardsProps> = ({ tokens: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle title="Last cycle rewards" data-testid="LastCycleRewards" />
      <TokenRewardsMetrics {...rest} token={rif} />
      <TokenRewardsMetrics {...rest} token={rbtc} />
    </MetricsCard>
  )
}

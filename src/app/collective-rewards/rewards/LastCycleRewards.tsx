import { useCycleContext } from '@/app/collective-rewards/metrics/context/CycleContext'
import {
  formatMetrics,
  getLastCycleRewards,
  MetricsCard,
  MetricsCardTitle,
  MetricsCardWithSpinner,
  TokenMetricsCardRow,
  useGetNotifyRewardLogs,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC, useEffect, useState } from 'react'
import { Address } from 'viem'

type TokenRewardsProps = {
  gauge: Address
  currency?: string
  token: {
    symbol: string
    address: Address
  }
}

const TokenRewardsMetrics: FC<TokenRewardsProps> = ({
  gauge,
  token: { symbol, address },
  currency = 'USD',
}) => {
  const { data: cycle, isLoading: cycleLoading, error: cycleError } = useCycleContext()
  const { data: rewardsPerToken, isLoading: logsLoading, error: rewardsError } = useGetNotifyRewardLogs(gauge)

  const error = cycleError ?? rewardsError
  useHandleErrors({ error, title: 'Error loading last cycle rewards' })

  const { prices } = usePricesContext()

  const lastCycleRewards = getLastCycleRewards(cycle, rewardsPerToken[address])
  const lastCycleRewardsInHuman = Number(formatBalanceToHuman(lastCycleRewards.builderAmount))
  const price = prices[symbol]?.price ?? 0
  const { amount, fiatAmount } = formatMetrics(lastCycleRewardsInHuman, price, symbol, currency)

  return withSpinner(TokenMetricsCardRow)({
    amount,
    fiatAmount,
    isLoading: cycleLoading || logsLoading,
  })
}

type LastCycleRewardsProps = {
  gauge: Address
  data: {
    [token: string]: {
      symbol: string
      address: Address
    }
  }
  currency?: string
}

export const LastCycleRewards: FC<LastCycleRewardsProps> = ({ data: { rif, rbtc }, ...rest }) => {
  return (
    <MetricsCard borderless>
      <MetricsCardTitle title="Last cycle rewards" data-testid="LastCycleRewards" />
      <TokenRewardsMetrics {...rest} token={rif} />
      <TokenRewardsMetrics {...rest} token={rbtc} />
    </MetricsCard>
  )
}

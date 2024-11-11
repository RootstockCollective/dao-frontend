import { useCycleContext } from '@/app/collective-rewards/metrics/context/CycleContext'
import {
  formatMetrics,
  getLastCycleRewards,
  MetricsCardTitle,
  MetricsCardWithSpinner,
  TokenMetricsCardRow,
  useGetNotifyRewardLogs,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
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
  setState: (state: { isLoading: boolean }) => void
}

const RewardsTokenMetrics: FC<TokenRewardsProps> = ({
  gauge,
  token: { symbol, address },
  currency = 'USD',
  setState,
}) => {
  const { data: cycle, isLoading: cycleLoading, error: cycleError } = useCycleContext()
  const { data: rewardsPerToken, isLoading: logsLoading, error: rewardsError } = useGetNotifyRewardLogs(gauge)

  const error = cycleError ?? rewardsError
  useHandleErrors([{ error: error, title: 'Error loading last cycle rewards' }])

  const { prices } = usePricesContext()

  const lastCycleRewards = getLastCycleRewards(cycle, rewardsPerToken[address])
  const lastCycleRewardsInHuman = Number(formatBalanceToHuman(lastCycleRewards.builderAmount))
  const price = prices[symbol]?.price ?? 0
  const { amount, fiatAmount } = formatMetrics(lastCycleRewardsInHuman, price, symbol, currency)

  useEffect(() => {
    setState({ isLoading: cycleLoading || logsLoading })
  }, [cycleLoading, logsLoading, setState])

  return <TokenMetricsCardRow amount={amount} fiatAmount={fiatAmount} />
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
  const [{ isLoading: isLoadingRif }, setRifState] = useState({ isLoading: false })
  const [{ isLoading: isLoadingRbtc }, setRbtcState] = useState({ isLoading: false })

  return (
    <MetricsCardWithSpinner isLoading={isLoadingRif || isLoadingRbtc} borderless>
      <MetricsCardTitle title="Last cycle rewards" data-testid="LastCycleRewards" />
      <RewardsTokenMetrics {...rest} token={rif} setState={() => setRifState} />
      <RewardsTokenMetrics {...rest} token={rbtc} setState={() => setRbtcState} />
    </MetricsCardWithSpinner>
  )
}

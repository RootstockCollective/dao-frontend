import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { Address } from 'viem'
import { usePricesContext } from '@/shared/context/PricesContext'
import { FC } from 'react'
import { Cycle, useCycleContext } from '@/app/collective-rewards/metrics/context/CycleContext'
import {
  NotifyRewardEventLog,
  useGetNotifyRewardLogs,
  MetricsCardWithSpinner,
  formatMetrics,
  getLastCycleRewards,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'

type LastCycleRewardsProps = {
  gauge: Address
  currency?: string
  data: {
    [token: string]: {
      symbol: string
      address: Address
    }
  }
}

const useGetRewardMetrics = (cycle: Cycle, logs: NotifyRewardEventLog, symbol: string, currency: string) => {
  const { prices } = usePricesContext()

  const lastCycleRewards = getLastCycleRewards(cycle, logs)
  const lastCycleRewardsInHuman = Number(formatBalanceToHuman(lastCycleRewards.builderAmount))
  const price = prices[symbol]?.price ?? 0

  return formatMetrics(lastCycleRewardsInHuman, price, symbol, currency)
}

export const LastCycleRewards: FC<LastCycleRewardsProps> = ({
  gauge,
  data: { rif, rbtc },
  currency = 'USD',
}) => {
  const { data: cycle, isLoading: cycleLoading, error: cycleError } = useCycleContext()
  const { data: rewardsPerToken, isLoading: logsLoading, error: rewardsError } = useGetNotifyRewardLogs(gauge)

  useHandleErrors([
    { error: cycleError, title: 'Error loading cycle' },
    { error: rewardsError, title: 'Error loading rewards' },
  ])

  const rifRewardsMetrics = useGetRewardMetrics(cycle, rewardsPerToken[rif.address], rif.symbol, currency)
  const rbtcRewardsMetrics = useGetRewardMetrics(cycle, rewardsPerToken[rbtc.address], rbtc.symbol, currency)

  const isLoading = cycleLoading || logsLoading

  return (
    <MetricsCardWithSpinner
      title="Last cycle rewards"
      data={{ rif: rifRewardsMetrics, rbtc: rbtcRewardsMetrics }}
      isLoading={isLoading}
      borderless
    />
  )
}

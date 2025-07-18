import { useCycleContext } from '@/app/collective-rewards/metrics/context/CycleContext'
import {
  formatMetrics,
  getNotifyRewardAmount,
  useGetGaugeNotifyRewardLogs,
  useGetLastCycleDistribution,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { USD } from '@/lib/constants'
import { TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'
import { Address } from 'viem'

interface UseBuilderLastCycleRewardsProps {
  gauge: Address
}

interface TokenRewardData {
  amount: string
  fiatAmount: string
  isLoading: boolean
}

interface LastCycleRewardsData {
  rif: TokenRewardData
  rbtc: TokenRewardData
}

export const useBuilderLastCycleRewards = ({
  gauge,
}: UseBuilderLastCycleRewardsProps): LastCycleRewardsData => {
  const { rif, rbtc } = TOKENS
  const { prices } = usePricesContext()
  const { data: cycle, isLoading: cycleLoading, error: cycleError } = useCycleContext()
  const {
    data: { fromTimestamp, toTimestamp } = {},
    isLoading: lastCycleRewardsLoading,
    error: lastCycleRewardsError,
  } = useGetLastCycleDistribution(cycle)

  const {
    data: rifRewardsPerToken,
    isLoading: rifLogsLoading,
    error: rifRewardsError,
  } = useGetGaugeNotifyRewardLogs(gauge, rif.address, fromTimestamp, toTimestamp)

  const {
    data: rbtcRewardsPerToken,
    isLoading: rbtcLogsLoading,
    error: rbtcRewardsError,
  } = useGetGaugeNotifyRewardLogs(gauge, rbtc.address, fromTimestamp, toTimestamp)

  useHandleErrors({
    error: cycleError ?? lastCycleRewardsError ?? rifRewardsError ?? rbtcRewardsError,
    title: 'Error loading last cycle rewards',
  })

  const rifAmount =
    getNotifyRewardAmount(rifRewardsPerToken, rif.address, 'builderAmount_')[rif.address] ?? 0n
  const rbtcAmount =
    getNotifyRewardAmount(rbtcRewardsPerToken, rbtc.address, 'builderAmount_')[rbtc.address] ?? 0n

  const rifPrice = prices[rif.symbol]?.price ?? 0
  const rbtcPrice = prices[rbtc.symbol]?.price ?? 0

  const rifFormatted = formatMetrics(rifAmount, rifPrice, rif.symbol, USD)
  const rbtcFormatted = formatMetrics(rbtcAmount, rbtcPrice, rbtc.symbol, USD)

  return {
    rif: {
      amount: rifFormatted.amount,
      fiatAmount: rifFormatted.fiatAmount,
      isLoading: cycleLoading || lastCycleRewardsLoading || rifLogsLoading,
    },
    rbtc: {
      amount: rbtcFormatted.amount,
      fiatAmount: rbtcFormatted.fiatAmount,
      isLoading: cycleLoading || lastCycleRewardsLoading || rbtcLogsLoading,
    },
  }
}

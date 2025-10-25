import { useCycleContext } from '@/app/collective-rewards/metrics/context/CycleContext'
import {
  formatMetrics,
  getNotifyRewardAmount,
  useGetGaugeNotifyRewardLogs,
  useGetLastCycleDistribution,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { TOKENS } from '@/lib/tokens'
import { Address } from 'viem'

interface UseBuilderLastCycleRewardsProps {
  gauge: Address
}

interface LastCycleRewardsData {
  rif: bigint
  rbtc: bigint
  usdrif: bigint
  isLoading: boolean
  error: Error | null
}

const useGetNotifyRewardAmountFromLogs = (
  token: Address,
  gauge: Address,
  fromTimestamp?: number,
  toTimestamp?: number,
) => {
  const {
    data: rewardsPerToken,
    isLoading: logsLoading,
    error: rewardsError,
  } = useGetGaugeNotifyRewardLogs(gauge, token, fromTimestamp, toTimestamp)

  return {
    amount: getNotifyRewardAmount(rewardsPerToken, token, 'builderAmount_')[token] ?? 0n,
    isLoading: logsLoading,
    error: rewardsError,
  }
}

export const useGetBuilderLastCycleRewards = ({
  gauge,
}: UseBuilderLastCycleRewardsProps): LastCycleRewardsData => {
  const { rif, rbtc, usdrif } = TOKENS
  const { data: cycle, isLoading: cycleLoading, error: cycleError } = useCycleContext()
  const {
    data: { fromTimestamp, toTimestamp } = {},
    isLoading: lastCycleRewardsLoading,
    error: lastCycleRewardsError,
  } = useGetLastCycleDistribution(cycle)

  const rifAmount = useGetNotifyRewardAmountFromLogs(rif.address, gauge, fromTimestamp, toTimestamp)
  const rbtcAmount = useGetNotifyRewardAmountFromLogs(rbtc.address, gauge, fromTimestamp, toTimestamp)
  const usdrifAmount = useGetNotifyRewardAmountFromLogs(usdrif.address, gauge, fromTimestamp, toTimestamp)

  useHandleErrors({
    error: cycleError ?? lastCycleRewardsError ?? rifAmount.error ?? rbtcAmount.error,
    title: 'Error loading last cycle rewards',
  })

  return {
    rif: rifAmount.amount,
    rbtc: rbtcAmount.amount,
    usdrif: usdrifAmount.amount,
    isLoading:
      cycleLoading ||
      lastCycleRewardsLoading ||
      rifAmount.isLoading ||
      rbtcAmount.isLoading ||
      usdrifAmount.isLoading,
    error: cycleError ?? lastCycleRewardsError ?? rifAmount.error ?? rbtcAmount.error ?? usdrifAmount.error,
  }
}

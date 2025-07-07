import { useCycleContext } from '@/app/collective-rewards/metrics/context/CycleContext'
import {
  getNotifyRewardAmount,
  useGetGaugeNotifyRewardLogs,
  useGetLastCycleDistribution,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'
import { Address } from 'viem'
import { formatRewards } from '../../utils'

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

export const useGetNotifyRewardAmountFromLogs = (
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
  const { rif, rbtc } = TOKENS
  const { prices } = usePricesContext()
  const { data: cycle, isLoading: cycleLoading, error: cycleError } = useCycleContext()
  const {
    data: { fromTimestamp, toTimestamp } = {},
    isLoading: lastCycleRewardsLoading,
    error: lastCycleRewardsError,
  } = useGetLastCycleDistribution(cycle)

  const rifAmount = useGetNotifyRewardAmountFromLogs(rif.address, gauge, fromTimestamp, toTimestamp)
  const rbtcAmount = useGetNotifyRewardAmountFromLogs(rbtc.address, gauge, fromTimestamp, toTimestamp)

  useHandleErrors({
    error: cycleError ?? lastCycleRewardsError ?? rifAmount.error ?? rbtcAmount.error,
    title: 'Error loading last cycle rewards',
  })

  const rifPrice = prices[rif.symbol]?.price ?? 0
  const rbtcPrice = prices[rbtc.symbol]?.price ?? 0

  const rifFormatted = formatRewards(rifAmount.amount, rifPrice, rif.symbol)
  const rbtcFormatted = formatRewards(rbtcAmount.amount, rbtcPrice, rbtc.symbol)

  return {
    rif: {
      amount: rifFormatted.amount,
      fiatAmount: rifFormatted.fiatAmount,
      isLoading: cycleLoading || lastCycleRewardsLoading || rifAmount.isLoading,
    },
    rbtc: {
      amount: rbtcFormatted.amount,
      fiatAmount: rbtcFormatted.fiatAmount,
      isLoading: cycleLoading || lastCycleRewardsLoading || rbtcAmount.isLoading,
    },
  }
}

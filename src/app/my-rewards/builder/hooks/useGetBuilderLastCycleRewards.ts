import { useCycleContext } from '@/app/collective-rewards/metrics/context/CycleContext'
import {
  formatMetrics,
  getNotifyRewardAmount,
  useGetGaugeNotifyRewardLogs,
  useGetLastCycleDistribution,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { RBTC, RIF, TOKENS, TokenSymbol } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'
import { Address } from 'viem'
import { FormattedTokenRewardData } from '../../backers/hooks/useBackerTotalEarned'

interface UseBuilderLastCycleRewardsProps {
  gauge: Address
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
}: UseBuilderLastCycleRewardsProps): Partial<Record<TokenSymbol, FormattedTokenRewardData>> => {
  const { prices } = usePricesContext()
  const { data: cycle, isLoading: cycleLoading, error: cycleError } = useCycleContext()
  const {
    data: { fromTimestamp, toTimestamp } = {},
    isLoading: lastCycleRewardsLoading,
    error: lastCycleRewardsError,
  } = useGetLastCycleDistribution(cycle)

  const rifAmount = useGetNotifyRewardAmountFromLogs(TOKENS[RIF].address, gauge, fromTimestamp, toTimestamp)
  const rbtcAmount = useGetNotifyRewardAmountFromLogs(TOKENS[RBTC].address, gauge, fromTimestamp, toTimestamp)

  useHandleErrors({
    error: cycleError ?? lastCycleRewardsError ?? rifAmount.error ?? rbtcAmount.error,
    title: 'Error loading last cycle rewards',
  })

  const rifPrice = prices[RIF]?.price ?? 0
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const rifFormatted = formatMetrics(rifAmount.amount, rifPrice, RIF)
  const rbtcFormatted = formatMetrics(rbtcAmount.amount, rbtcPrice, RBTC)

  return {
    [RIF]: {
      amount: rifFormatted.amount,
      fiatAmount: rifFormatted.fiatAmount,
      isLoading: cycleLoading || lastCycleRewardsLoading || rifAmount.isLoading,
      error: cycleError ?? lastCycleRewardsError ?? rifAmount.error,
    },
    [RBTC]: {
      amount: rbtcFormatted.amount,
      fiatAmount: rbtcFormatted.fiatAmount,
      isLoading: cycleLoading || lastCycleRewardsLoading || rbtcAmount.isLoading,
      error: cycleError ?? lastCycleRewardsError ?? rbtcAmount.error,
    },
  }
}

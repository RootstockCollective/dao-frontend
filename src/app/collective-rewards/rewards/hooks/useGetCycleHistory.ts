import { useMemo } from 'react'

import { useGetGaugesArray } from '@/app/collective-rewards/user'
import Big from '@/lib/big'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'

import { CycleHistoryEntry } from '../../types'
import { buildCycleHistory, getAllTimeRewardsFiat } from '../../utils/buildCycleHistory'
import { useGetBackersPerCycle } from './useGetBackersPerCycle'
import { useGetChartBackingData } from './useGetChartBackingData'
import { useGetChartRewardsData } from './useGetChartRewardsData'
import { useGetGaugesNotifyReward } from './useGetGaugesNotifyReward'
import { useGetTotalRewardsDistributed } from './useGetTotalRewardsDistributed'

const REWARD_TOKEN_ADDRESSES = REWARD_TOKEN_KEYS.map(tokenKey => TOKENS[tokenKey].address)

interface UseGetCycleHistoryResult {
  data: CycleHistoryEntry[]
  /** `null` until the all-time totals load. */
  paidAllTime: Big | null
  isLoading: boolean
  error: Error | null
}

/**
 * Only cycles and daily allocations gate `isLoading`/`error`. The NotifyReward events and the
 * per-cycle Backer counts fill two columns that degrade to a dash on their own.
 */
export const useGetCycleHistory = (): UseGetCycleHistoryResult => {
  const { data: cycles, isLoading: cyclesLoading, error: cyclesError } = useGetChartRewardsData()
  const {
    data: dailyAllocations,
    isLoading: allocationsLoading,
    error: allocationsError,
  } = useGetChartBackingData()

  const { data: gauges } = useGetGaugesArray()
  // `0` makes the hook wait for the cycles rather than fetch every gauge's full history.
  const oldestCycleStart = cycles?.length ? Number(cycles[cycles.length - 1].currentCycleStart) : 0
  const { data: notifyRewards } = useGetGaugesNotifyReward({
    gauges,
    rewardTokens: REWARD_TOKEN_ADDRESSES,
    fromTimestamp: oldestCycleStart,
  })
  const {
    data: totalsByToken,
    isPending: totalsPending,
    error: totalsError,
  } = useGetTotalRewardsDistributed()

  const { data: backersPerCycle } = useGetBackersPerCycle()
  const { prices } = usePricesContext()

  const data = useMemo(() => {
    if (!cycles?.length || !dailyAllocations) return []

    return buildCycleHistory({
      cycles,
      dailyAllocations,
      notifyRewards: notifyRewards ?? {},
      backersPerCycle,
      prices,
      nowSeconds: Math.floor(Date.now() / 1000),
    })
  }, [cycles, dailyAllocations, notifyRewards, backersPerCycle, prices])

  // Not summed from the NotifyReward events: an empty gauge list would read as a confident $0.
  const paidAllTime = useMemo(
    () => (totalsPending || totalsError ? null : getAllTimeRewardsFiat(totalsByToken, prices)),
    [totalsByToken, totalsPending, totalsError, prices],
  )

  return {
    data,
    paidAllTime,
    isLoading: cyclesLoading || allocationsLoading,
    error: cyclesError ?? allocationsError ?? null,
  }
}

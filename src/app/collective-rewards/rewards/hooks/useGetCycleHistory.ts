import { useMemo } from 'react'

import { useGetGaugesArray } from '@/app/collective-rewards/user'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'

import { CycleHistoryEntry } from '../../types'
import { buildCycleHistory } from '../../utils/buildCycleHistory'
import { useGetBackersPerCycle } from './useGetBackersPerCycle'
import { useGetChartBackingData } from './useGetChartBackingData'
import { useGetChartRewardsData } from './useGetChartRewardsData'
import { useGetGaugesNotifyReward } from './useGetGaugesNotifyReward'

const REWARD_TOKEN_ADDRESSES = REWARD_TOKEN_KEYS.map(tokenKey => TOKENS[tokenKey].address)

interface UseGetCycleHistoryResult {
  data: CycleHistoryEntry[]
  /** True only while the sources the table cannot render without are still in flight. */
  isLoading: boolean
  error: Error | null
}

/**
 * One row per cycle for the dashboard's table, chart and distribution panel.
 *
 * Four sources feed this, with different reliability. Cycles and daily allocations are the
 * backbone — without them there is nothing to show. The NotifyReward events and the per-cycle
 * Backer counts only fill in two columns, so they are deliberately excluded from `isLoading`
 * and `error`: a slow gauge fetch shouldn't hold up a table that can already render eight
 * tenths of itself, and the columns they feed degrade to a dash on their own.
 */
export const useGetCycleHistory = (): UseGetCycleHistoryResult => {
  const { data: cycles, isLoading: cyclesLoading, error: cyclesError } = useGetChartRewardsData()
  const {
    data: dailyAllocations,
    isLoading: allocationsLoading,
    error: allocationsError,
  } = useGetChartBackingData()

  const { data: gauges } = useGetGaugesArray()
  const { data: notifyRewards } = useGetGaugesNotifyReward({
    gauges: gauges ?? [],
    rewardTokens: REWARD_TOKEN_ADDRESSES,
  })

  const { data: backersPerCycle } = useGetBackersPerCycle()
  const { prices } = usePricesContext()

  const data = useMemo(() => {
    if (!cycles?.length) return []

    return buildCycleHistory({
      cycles,
      dailyAllocations: dailyAllocations ?? [],
      notifyRewards: notifyRewards ?? {},
      backersPerCycle,
      prices,
      nowSeconds: Math.floor(Date.now() / 1000),
    })
  }, [cycles, dailyAllocations, notifyRewards, backersPerCycle, prices])

  return {
    data,
    isLoading: cyclesLoading || allocationsLoading,
    error: cyclesError ?? allocationsError ?? null,
  }
}

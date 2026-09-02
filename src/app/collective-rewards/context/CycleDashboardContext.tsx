'use client'

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'

import Big from '@/lib/big'

import { useGetCycleHistory } from '../rewards/hooks/useGetCycleHistory'
import { useGetActiveBuildersCount } from '../shared/hooks/useGetActiveBuildersCount'
import { CycleHistoryEntry } from '../types'
import { useHandleErrors } from '../utils'

interface CycleDashboardValue {
  cycles: CycleHistoryEntry[]
  isLoading: boolean
  selectCycle: (cycleNumber: number) => void
  /**
   * Combined USD distributed to date, from the reward events. `null` until they load, which
   * is not the same as a total of zero.
   */
  paidAllTime: Big | null
  /** Active Builders right now. Only meaningful against the running cycle. */
  buildersCount: number | null
  /** The cycle every section of the page describes. Defaults to the running one. */
  selectedCycle?: CycleHistoryEntry
  /** The newest cycle, which is the one still open. */
  runningCycle?: CycleHistoryEntry
}

const CycleDashboardContext = createContext<CycleDashboardValue | null>(null)

export const useCycleDashboard = () => {
  const value = useContext(CycleDashboardContext)
  if (!value) {
    throw new Error('useCycleDashboard must be used inside a CycleDashboardProvider')
  }
  return value
}

/**
 * Holds the cycle the whole page is describing.
 *
 * Selection has to live above every section: the history table promises that picking a row
 * loads it "above", and that only holds if the metric tiles, the chart and the distribution
 * panel all read the same value. Fetching here too means the per-cycle fold runs once for the
 * page rather than once per section that needs it.
 */
export const CycleDashboardProvider = ({ children }: { children: ReactNode }) => {
  const { data: cycles, paidAllTime, isLoading, error } = useGetCycleHistory()
  const { data: buildersData } = useGetActiveBuildersCount()
  const [selectedCycleNumber, setSelectedCycleNumber] = useState<number | null>(null)

  useHandleErrors({ error, title: 'Error loading cycle history' })

  const selectCycle = useCallback((cycleNumber: number) => setSelectedCycleNumber(cycleNumber), [])

  const value = useMemo<CycleDashboardValue>(() => {
    // Cycles arrive newest first, so the head is the one currently running.
    const runningCycle = cycles[0]
    /**
     * A settled cycle whose NotifyReward events never landed renders a dash where its split
     * should be, and if it happens to be the newest one that is the first thing a visitor
     * sees. Skip past it to the newest cycle that can answer in full.
     *
     * A *running* cycle is exempt: it legitimately has no split for the first hours of its
     * life, and it is the one the page is built around — dropping to an older cycle would
     * hide the live one behind stale figures.
     */
    const defaultCycle =
      runningCycle?.status === 'running'
        ? runningCycle
        : (cycles.find(({ backersShare }) => backersShare !== null) ?? runningCycle)

    return {
      cycles,
      isLoading,
      runningCycle,
      selectedCycle: cycles.find(({ cycleNumber }) => cycleNumber === selectedCycleNumber) ?? defaultCycle,
      selectCycle,
      paidAllTime,
      buildersCount: buildersData?.count ?? null,
    }
  }, [cycles, isLoading, selectedCycleNumber, selectCycle, paidAllTime, buildersData?.count])

  return <CycleDashboardContext.Provider value={value}>{children}</CycleDashboardContext.Provider>
}

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
  /** Combined USD distributed across every cycle to date. */
  paidAllTime: Big
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
  const { data: cycles, isLoading, error } = useGetCycleHistory()
  const { data: buildersData } = useGetActiveBuildersCount()
  const [selectedCycleNumber, setSelectedCycleNumber] = useState<number | null>(null)

  useHandleErrors({ error, title: 'Error loading cycle history' })

  const selectCycle = useCallback((cycleNumber: number) => setSelectedCycleNumber(cycleNumber), [])

  const value = useMemo<CycleDashboardValue>(() => {
    // Cycles arrive newest first, so the head is the one currently running.
    const runningCycle = cycles[0]

    return {
      cycles,
      isLoading,
      runningCycle,
      selectedCycle: cycles.find(({ cycleNumber }) => cycleNumber === selectedCycleNumber) ?? runningCycle,
      selectCycle,
      paidAllTime: cycles.reduce((acc, { rewardsFiat }) => acc.add(rewardsFiat), Big(0)),
      buildersCount: buildersData?.count ?? null,
    }
  }, [cycles, isLoading, selectedCycleNumber, selectCycle, buildersData?.count])

  return <CycleDashboardContext.Provider value={value}>{children}</CycleDashboardContext.Provider>
}

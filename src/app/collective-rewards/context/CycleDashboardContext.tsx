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
  /** `null` until the all-time totals load. */
  paidAllTime: Big | null
  /** Active Builders right now; only meaningful for the running cycle. */
  buildersCount: number | null
  /** The cycle every section describes. */
  selectedCycle?: CycleHistoryEntry
  /** Undefined when the newest indexed cycle has already closed. */
  runningCycle?: CycleHistoryEntry
}

const CycleDashboardContext = createContext<CycleDashboardValue | null>(null)

export const getRunningCycle = (cycles: CycleHistoryEntry[]): CycleHistoryEntry | undefined =>
  cycles[0]?.status === 'running' ? cycles[0] : undefined

/**
 * The running cycle, or else the newest settled cycle whose split has landed — a settled cycle
 * with no NotifyReward events would open the page on a dash.
 */
export const getDefaultCycle = (cycles: CycleHistoryEntry[]): CycleHistoryEntry | undefined => {
  const newest = cycles[0]
  if (newest?.status === 'running') return newest

  return cycles.find(({ backersShare }) => backersShare !== null) ?? newest
}

export const useCycleDashboard = () => {
  const value = useContext(CycleDashboardContext)
  if (!value) {
    throw new Error('useCycleDashboard must be used inside a CycleDashboardProvider')
  }
  return value
}

export const CycleDashboardProvider = ({ children }: { children: ReactNode }) => {
  const { data: cycles, paidAllTime, isLoading, error } = useGetCycleHistory()
  const { data: buildersData } = useGetActiveBuildersCount()
  const [selectedCycleNumber, setSelectedCycleNumber] = useState<number | null>(null)

  useHandleErrors({ error, title: 'Error loading cycle history' })

  const selectCycle = useCallback((cycleNumber: number) => setSelectedCycleNumber(cycleNumber), [])

  const value = useMemo<CycleDashboardValue>(
    () => ({
      cycles,
      isLoading,
      runningCycle: getRunningCycle(cycles),
      selectedCycle:
        cycles.find(({ cycleNumber }) => cycleNumber === selectedCycleNumber) ?? getDefaultCycle(cycles),
      selectCycle,
      paidAllTime,
      buildersCount: buildersData?.count ?? null,
    }),
    [cycles, isLoading, selectedCycleNumber, selectCycle, paidAllTime, buildersData?.count],
  )

  return <CycleDashboardContext.Provider value={value}>{children}</CycleDashboardContext.Provider>
}

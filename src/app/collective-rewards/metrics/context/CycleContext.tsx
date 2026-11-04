import { DateTime, Duration } from 'luxon'
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'

import { useReadCycleTimeKeeper } from '@/shared/hooks/contracts'

import { useIntervalTimestamp } from '../hooks/useIntervalTimestamp'

export interface Cycle {
  cycleStart: DateTime
  cycleDuration: Duration
  cycleNext: DateTime
  firstCycleStart: DateTime
  endDistributionWindow: DateTime
}

interface CycleContextValue {
  data: Cycle
  isLoading: boolean
  error: Error | null
}

const CycleContext = createContext<CycleContextValue>({
  data: {} as Cycle,
  isLoading: false,
  error: null,
})

interface CycleProviderProps {
  children: ReactNode
}

const DEFAULT_CYCLE_DATA: Cycle = {
  cycleStart: DateTime.fromSeconds(0),
  cycleDuration: Duration.fromObject({ seconds: 0 }),
  cycleNext: DateTime.fromSeconds(0),
  firstCycleStart: DateTime.fromSeconds(0),
  endDistributionWindow: DateTime.fromSeconds(0),
}

export const CycleContextProvider = ({ children }: CycleProviderProps) => {
  const timestamp = useIntervalTimestamp()
  const [cycleData, setCycleData] = useState<Cycle>(DEFAULT_CYCLE_DATA)

  const {
    data: cycleStartAndDuration,
    isLoading: cycleStartAndDurationLoading,
    error: cycleStartAndDurationError,
  } = useReadCycleTimeKeeper({ functionName: 'getCycleStartAndDuration' })

  const {
    data: cycleStart,
    isLoading: cycleStartLoading,
    error: cycleStartError,
  } = useReadCycleTimeKeeper({ functionName: 'cycleStart', args: [timestamp] })

  const {
    data: endDistributionWindow,
    isLoading: endDistributionWindowLoading,
    error: endDistributionWindowError,
  } = useReadCycleTimeKeeper(
    { functionName: 'endDistributionWindow', args: [timestamp] },
    { placeholderData: 0n },
  )

  const {
    data: cycleNext,
    isLoading: cycleNextLoading,
    error: cycleNextError,
  } = useReadCycleTimeKeeper({ functionName: 'cycleNext', args: [timestamp] })

  const isLoading =
    cycleStartAndDurationLoading || cycleStartLoading || endDistributionWindowLoading || cycleNextLoading

  const error = cycleStartAndDurationError || cycleStartError || endDistributionWindowError || cycleNextError

  const [firstCycleStart, cycleDuration] = cycleStartAndDuration || []

  const freshCycleData = useMemo((): Cycle | null => {
    if (!cycleStart || !cycleNext || !firstCycleStart || !cycleDuration || !endDistributionWindow) {
      return null
    }

    return {
      cycleStart: DateTime.fromSeconds(Number(cycleStart)),
      cycleNext: DateTime.fromSeconds(Number(cycleNext)),
      cycleDuration: Duration.fromObject({ seconds: Number(cycleDuration) }),
      firstCycleStart: DateTime.fromSeconds(Number(firstCycleStart)),
      endDistributionWindow: DateTime.fromSeconds(Number(endDistributionWindow)),
    }
  }, [cycleStart, cycleNext, firstCycleStart, cycleDuration, endDistributionWindow])

  useEffect(() => {
    if (freshCycleData && !isSameCycle(cycleData, freshCycleData)) {
      setCycleData(freshCycleData)
    }
  }, [freshCycleData, cycleData])

  const data = useMemo(() => {
    if (!freshCycleData || isSameCycle(cycleData, freshCycleData)) {
      return cycleData
    }

    return freshCycleData
  }, [freshCycleData, cycleData])

  const valueOfContext: CycleContextValue = {
    data,
    isLoading,
    error,
  }

  return <CycleContext.Provider value={valueOfContext}>{children}</CycleContext.Provider>
}

export const useCycleContext = () => useContext(CycleContext)

const isSameCycle = (a: Cycle, b: Cycle) => {
  return (
    a.cycleStart.toMillis() === b.cycleStart.toMillis() &&
    a.cycleNext.toMillis() === b.cycleNext.toMillis() &&
    a.cycleDuration.equals(b.cycleDuration) &&
    a.firstCycleStart.toMillis() === b.firstCycleStart.toMillis() &&
    a.endDistributionWindow.toMillis() === b.endDistributionWindow.toMillis()
  )
}

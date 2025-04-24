import { useReadCycleTimeKeeper } from '@/shared/hooks/contracts'
import { DateTime, Duration } from 'luxon'
import { createContext, FC, ReactNode, useContext, useMemo, useState } from 'react'
import { useIntervalTimestamp } from '../hooks/useIntervalTimestamp'

export type Cycle = {
  cycleStart: DateTime
  cycleDuration: Duration
  cycleNext: DateTime
  firstCycleStart: DateTime
  endDistributionWindow: DateTime
}

type CycleContextValue = {
  data: Cycle
  isLoading: boolean
  error: Error | null
}

export const CycleContext = createContext<CycleContextValue>({
  data: {} as Cycle,
  isLoading: false,
  error: null,
})

type CycleProviderProps = {
  children: ReactNode
}

const DEFAULT_CYCLE_DATA: Cycle = {
  cycleStart: DateTime.fromSeconds(0),
  cycleDuration: Duration.fromObject({ seconds: 0 }),
  cycleNext: DateTime.fromSeconds(0),
  firstCycleStart: DateTime.fromSeconds(0),
  endDistributionWindow: DateTime.fromSeconds(0),
}

export const CycleContextProvider: FC<CycleProviderProps> = ({ children }) => {
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
    { initialData: 0n },
  )

  const {
    data: cycleNext,
    isLoading: cycleNextLoading,
    error: cycleNextError,
  } = useReadCycleTimeKeeper({ functionName: 'cycleNext', args: [timestamp] })

  const isLoading =
    cycleStartAndDurationLoading || cycleStartLoading || endDistributionWindowLoading || cycleNextLoading

  const error = cycleStartAndDurationError || cycleStartError || endDistributionWindowError || cycleNextError

  const data = useMemo(() => {
    const [firstCycleStart, cycleDuration] = cycleStartAndDuration || []
    if (cycleStart && cycleNext && firstCycleStart && cycleDuration && endDistributionWindow) {
      const newCycleData: Cycle = {
        cycleStart: DateTime.fromSeconds(Number(cycleStart)),
        cycleNext: DateTime.fromSeconds(Number(cycleNext)),
        cycleDuration: Duration.fromObject({ seconds: Number(cycleDuration) }),
        firstCycleStart: DateTime.fromSeconds(Number(firstCycleStart)),
        endDistributionWindow: DateTime.fromSeconds(Number(endDistributionWindow)),
      }

      if (!isSameCycle(cycleData, newCycleData)) {
        setCycleData(newCycleData)

        return newCycleData
      }
    }

    return cycleData
  }, [cycleStartAndDuration, cycleStart, endDistributionWindow, cycleNext, cycleData])

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

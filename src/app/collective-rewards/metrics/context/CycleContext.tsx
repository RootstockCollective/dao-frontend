import { createContext, FC, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { DateTime, Duration } from 'luxon'
import {
  useGetCycleNext,
  useGetCycleStart,
  useGetCycleStartAndDuration,
  useGetEndDistributionWindow,
  useGetTimestamp,
} from '@/app/collective-rewards/metrics'

export type Cycle = {
  cycleStart: DateTime
  cycleDuration: Duration
  cycleNext: DateTime
  fistCycleStart: DateTime
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

export const CycleContextProvider: FC<CycleProviderProps> = ({ children }) => {
  const timestamp = useGetTimestamp()

  const {
    data: cycleStartAndDurationData,
    isLoading: cycleStartAndDurationLoading,
    error: cycleStartAndDurationError,
  } = useGetCycleStartAndDuration()

  const [firstCycleStart, setFirstCycleStart] = useState(0n)
  const [cycleDuration, setCycleDuration] = useState(0n)

  useEffect(() => {
    if (cycleStartAndDurationData) {
      const [firstCycleStartData, cycleDurationData] = cycleStartAndDurationData
      if (firstCycleStartData !== firstCycleStart) {
        setFirstCycleStart(firstCycleStartData)
      }
      if (cycleDurationData !== cycleDuration) {
        setCycleDuration(cycleDurationData)
      }
    }
  }, [cycleDuration, cycleStartAndDurationData, firstCycleStart])

  const [cycleStart, setCycleStart] = useState(0n)

  const {
    data: cycleStartData,
    isLoading: cycleStartLoading,
    error: cycleStartError,
  } = useGetCycleStart(timestamp)

  useEffect(() => {
    if (cycleStartData && cycleStartData !== cycleStart) {
      setCycleStart(cycleStartData)
    }
  }, [cycleStart, cycleStartData])

  const [endDistributionWindow, setEndDistributionWindow] = useState(0n)

  const {
    data: endDistributionWindowData,
    isLoading: endDistributionWindowLoading,
    error: endDistributionWindowError,
  } = useGetEndDistributionWindow(timestamp)

  useEffect(() => {
    if (endDistributionWindowData && endDistributionWindowData !== endDistributionWindow) {
      setEndDistributionWindow(endDistributionWindowData)
    }
  }, [endDistributionWindow, endDistributionWindowData])

  const [cycleNext, setCycleNext] = useState(0n)

  const {
    data: cycleNextData,
    isLoading: cycleNextLoading,
    error: cycleNextError,
  } = useGetCycleNext(timestamp)

  useEffect(() => {
    if (cycleNextData && cycleNextData !== cycleNext) {
      setCycleNext(cycleNextData)
    }
  }, [cycleNext, cycleNextData])

  const isLoading =
    cycleStartAndDurationLoading || cycleStartLoading || endDistributionWindowLoading || cycleNextLoading

  const error = cycleStartAndDurationError || cycleStartError || endDistributionWindowError || cycleNextError

  const data = useMemo(
    () => ({
      cycleStart: DateTime.fromSeconds(Number(cycleStart ?? BigInt(0))),
      cycleNext: DateTime.fromSeconds(Number(cycleNext ?? BigInt(0))),
      cycleDuration: Duration.fromObject({ seconds: Number(cycleDuration ?? BigInt(0)) }),
      fistCycleStart: DateTime.fromSeconds(Number(firstCycleStart ?? BigInt(0))),
      endDistributionWindow: DateTime.fromSeconds(Number(endDistributionWindow ?? BigInt(0))),
    }),
    [firstCycleStart, cycleDuration, cycleStart, endDistributionWindow, cycleNext],
  )

  const valueOfContext: CycleContextValue = {
    data,
    isLoading,
    error,
  }

  return <CycleContext.Provider value={valueOfContext}>{children}</CycleContext.Provider>
}

export const useCycleContext = () => useContext(CycleContext)

import {
  useGetCycleNext,
  useGetCycleStart,
  useGetCycleStartAndDuration,
  useGetEndDistributionWindow,
} from '@/app/collective-rewards/metrics'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { DateTime, Duration } from 'luxon'
import { createContext, FC, ReactNode, useContext, useEffect, useMemo, useState } from 'react'

export type Cycle = {
  timestamp: bigint
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
  const [timestamp, setTimestamp] = useState(BigInt(DateTime.now().toUnixInteger()))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(BigInt(DateTime.now().toUnixInteger()))
    }, AVERAGE_BLOCKTIME)

    return () => clearInterval(interval) // Cleanup interval on component unmount
  }, [])

  const {
    data: cycleStartAndDuration,
    isLoading: cycleStartAndDurationLoading,
    error: cycleStartAndDurationError,
  } = useGetCycleStartAndDuration()

  const [firstCycleStart, cycleDuration] = cycleStartAndDuration || []

  const {
    data: cycleStart,
    isLoading: cycleStartLoading,
    error: cycleStartError,
  } = useGetCycleStart(timestamp)

  const {
    data: endDistributionWindow,
    isLoading: endDistributionWindowLoading,
    error: endDistributionWindowError,
  } = useGetEndDistributionWindow(timestamp)

  const { data: cycleNext, isLoading: cycleNextLoading, error: cycleNextError } = useGetCycleNext(timestamp)

  const isLoading =
    cycleStartAndDurationLoading || cycleStartLoading || endDistributionWindowLoading || cycleNextLoading

  const error = cycleStartAndDurationError || cycleStartError || endDistributionWindowError || cycleNextError

  const data = useMemo(
    () => ({
      timestamp,
      cycleStart: DateTime.fromSeconds(Number(cycleStart ?? 0)),
      cycleNext: DateTime.fromSeconds(Number(cycleNext ?? 0)),
      cycleDuration: Duration.fromObject({ seconds: Number(cycleDuration ?? 0) }),
      fistCycleStart: DateTime.fromSeconds(Number(firstCycleStart ?? 0)),
      endDistributionWindow: DateTime.fromSeconds(Number(endDistributionWindow ?? 0)),
    }),
    [timestamp, firstCycleStart, cycleDuration, cycleStart, endDistributionWindow, cycleNext],
  )

  const valueOfContext: CycleContextValue = {
    data,
    isLoading,
    error,
  }

  return <CycleContext.Provider value={valueOfContext}>{children}</CycleContext.Provider>
}

export const useCycleContext = () => useContext(CycleContext)

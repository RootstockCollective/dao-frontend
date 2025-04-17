import { useReadCycleTimeKeeper } from '@/shared/hooks/contracts'
import { DateTime, Duration } from 'luxon'
import { createContext, FC, ReactNode, useContext, useMemo } from 'react'
import { useIntervalTimestamp } from '../hooks/useIntervalTimestamp'

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
  const timestamp = useIntervalTimestamp()

  const {
    data: cycleStartAndDuration,
    isLoading: cycleStartAndDurationLoading,
    error: cycleStartAndDurationError,
  } = useReadCycleTimeKeeper({ functionName: 'getCycleStartAndDuration' }, { initialData: 0n })

  const [firstCycleStart, cycleDuration] = cycleStartAndDuration || []

  const {
    data: cycleStart,
    isLoading: cycleStartLoading,
    error: cycleStartError,
  } = useReadCycleTimeKeeper({ functionName: 'cycleStart', args: [timestamp] }, { initialData: 0n })

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
  } = useReadCycleTimeKeeper({ functionName: 'cycleNext', args: [timestamp] }, { initialData: 0n })

  const isLoading =
    cycleStartAndDurationLoading || cycleStartLoading || endDistributionWindowLoading || cycleNextLoading

  const error = cycleStartAndDurationError || cycleStartError || endDistributionWindowError || cycleNextError

  const data = useMemo(
    () => ({
      timestamp,
      cycleStart: DateTime.fromSeconds(Number(cycleStart ?? BigInt(0))),
      cycleNext: DateTime.fromSeconds(Number(cycleNext ?? BigInt(0))),
      cycleDuration: Duration.fromObject({ seconds: Number(cycleDuration ?? BigInt(0)) }),
      fistCycleStart: DateTime.fromSeconds(Number(firstCycleStart ?? BigInt(0))),
      endDistributionWindow: DateTime.fromSeconds(Number(endDistributionWindow ?? BigInt(0))),
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

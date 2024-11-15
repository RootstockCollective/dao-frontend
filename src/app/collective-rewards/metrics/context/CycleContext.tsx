import { createContext, FC, ReactNode, useContext } from 'react'
import { DateTime, Duration } from 'luxon'
import {
  useGetCycleNext,
  useGetCycleStart,
  useGetCycleStartAndDuration,
  useGetEndDistributionWindow,
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
  const timestamp = BigInt(DateTime.now().toUnixInteger())
  const {
    data: cycleStartAndDuration,
    isLoading: cycleStartAndDurationLoading,
    error: cycleStartAndDurationError,
  } = useGetCycleStartAndDuration()
  const [fistCycleStart, cycleDuration] = cycleStartAndDuration || []
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
  const error = cycleStartAndDurationError ?? cycleStartError ?? endDistributionWindowError ?? cycleNextError

  const valueOfContext: CycleContextValue = {
    data: {
      cycleStart: DateTime.fromSeconds(Number(cycleStart ?? 0n)),
      cycleNext: DateTime.fromSeconds(Number(cycleNext ?? 0n)),
      cycleDuration: Duration.fromObject({ seconds: Number(cycleDuration ?? 0n) }),
      fistCycleStart: DateTime.fromSeconds(Number(fistCycleStart ?? 0n)),
      endDistributionWindow: DateTime.fromSeconds(Number(endDistributionWindow ?? 0n)),
    },
    isLoading,
    error,
  }

  return <CycleContext.Provider value={valueOfContext}>{children}</CycleContext.Provider>
}

export const useCycleContext = () => useContext(CycleContext)

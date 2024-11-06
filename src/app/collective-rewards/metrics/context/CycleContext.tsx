import { createContext, FC, ReactNode, useContext } from 'react'
import { DateTime } from 'luxon'
import {
  useGetCycleStart,
  useGetCycleStartAndDuration,
  useGetEndDistributionWindow,
} from '@/app/collective-rewards/metrics'

export type Cycle = {
  cycleStart: DateTime
  cycleDuration: DateTime
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

  const isLoading = cycleStartAndDurationLoading || cycleStartLoading || endDistributionWindowLoading
  const error = cycleStartAndDurationError ?? cycleStartError ?? endDistributionWindowError

  const valueOfContext: CycleContextValue = {
    data: {
      cycleStart: DateTime.fromSeconds(Number(cycleStart ?? 0n)),
      cycleDuration: DateTime.fromSeconds(Number(cycleDuration ?? 0n)),
      fistCycleStart: DateTime.fromSeconds(Number(fistCycleStart ?? 0n)),
      endDistributionWindow: DateTime.fromSeconds(Number(endDistributionWindow ?? 0n)),
    },
    isLoading,
    error,
  }

  return <CycleContext.Provider value={valueOfContext}>{children}</CycleContext.Provider>
}

export const useCycleContext = () => useContext(CycleContext)

import { useReadGauges } from '@/shared/hooks/contracts'
import { createContext, FC, ReactNode, useContext, useMemo } from 'react'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { BackerEstimatedRewards } from '@/app/collective-rewards/types'

type BackingContextValue = {
  data: BackerEstimatedRewards[]
  isLoading: boolean
  error: Error | null
}

const BackingContext = createContext<BackingContextValue>({
  data: [],
  isLoading: false,
  error: null,
})

type BackingProviderProps = {
  children: ReactNode
  dynamicAllocations?: boolean
}

export const BackingContextProvider: FC<BackingProviderProps> = ({
  children,
  dynamicAllocations = false,
}) => {
  const {
    state: { allocations, isContextLoading },
    initialState: { allocations: initialAllocations },
  } = useContext(AllocationsContext)

  const {
    data: estimatedBuilders,
    isLoading: estimatedBuildersLoading,
    error: estimatedBuildersError,
  } = useGetBuilderEstimatedRewards()

  const gauges = useMemo(() => {
    return estimatedBuilders.map(({ gauge }) => gauge)
  }, [estimatedBuilders])

  const {
    data: totalAllocation,
    isLoading: totalAllocationLoading,
    error: totalAllocationError,
  } = useReadGauges({ addresses: gauges, functionName: 'totalAllocation' })

  const data: BackerEstimatedRewards[] = useMemo(() => {
    return estimatedBuilders.map((builder, index) => {
      const { address, backersEstimatedRewards } = builder

      const allocation = dynamicAllocations
        ? (allocations[address] ?? 0n)
        : (initialAllocations[address] ?? 0n)
      const builderAllocation = totalAllocation[index] ?? 0n

      const rifBackerEstimatedRewards = backersEstimatedRewards.rif
      const rbtcBackerEstimatedRewards = backersEstimatedRewards.rbtc

      const backerRifEstimatedRewards = builderAllocation
        ? (rifBackerEstimatedRewards.amount.value * allocation) / builderAllocation
        : 0n
      const backerRbtcEstimatedRewards = builderAllocation
        ? (rbtcBackerEstimatedRewards.amount.value * allocation) / builderAllocation
        : 0n

      return {
        ...builder,
        backerEstimatedRewards: {
          rif: {
            ...rifBackerEstimatedRewards,
            amount: {
              ...rifBackerEstimatedRewards.amount,
              value: backerRifEstimatedRewards,
            },
          },
          rbtc: {
            ...rbtcBackerEstimatedRewards,
            amount: {
              ...rbtcBackerEstimatedRewards.amount,
              value: backerRbtcEstimatedRewards,
            },
          },
        },
      }
    })
  }, [totalAllocation, allocations, estimatedBuilders, dynamicAllocations, initialAllocations])

  const isLoading = estimatedBuildersLoading || totalAllocationLoading || isContextLoading

  const error = estimatedBuildersError ?? totalAllocationError

  const valueOfContext: BackingContextValue = {
    data,
    isLoading,
    error,
  }

  return <BackingContext.Provider value={valueOfContext}>{children}</BackingContext.Provider>
}

export const useBackingContext = () => useContext(BackingContext)

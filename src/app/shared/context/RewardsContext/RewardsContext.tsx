import { useReadGauges } from '@/shared/hooks/contracts'
import { createContext, FC, ReactNode, useContext, useMemo } from 'react'

import { BackerEstimatedRewards } from '@/app/collective-rewards/types'
import { useGetBuilderEstimatedRewards } from '@/app/shared/hooks/useGetBuilderEstimatedRewards'
import { useBackingContext } from '../BackingContext'

type RewardsContextValue = {
  data: BackerEstimatedRewards[]
  isLoading: boolean
  error: Error | null
}

const RewardsContext = createContext<RewardsContextValue>({
  data: [],
  isLoading: false,
  error: null,
})

type RewardsProviderProps = {
  children: ReactNode
  dynamicAllocations?: boolean
}

export const RewardsContextProvider: FC<RewardsProviderProps> = ({
  children,
  dynamicAllocations = false,
}) => {
  const { backings, isLoading: isBackingLoading, error: backingsError } = useBackingContext()

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
      const { address, backerEstimatedRewards: backersEstimatedRewards } = builder

      const { onchain: onchainBacking, pending: pendingBacking } = backings[address] ?? {
        onchain: 0n,
        pending: 0n,
      }

      const backing = dynamicAllocations ? pendingBacking : onchainBacking
      const builderAllocation = totalAllocation[index] ?? 0n

      const rifBackerEstimatedRewards = backersEstimatedRewards.rif
      const rbtcBackerEstimatedRewards = backersEstimatedRewards.rbtc

      const backerRifEstimatedRewards = builderAllocation
        ? (rifBackerEstimatedRewards.amount.value * backing) / builderAllocation
        : 0n
      const backerRbtcEstimatedRewards = builderAllocation
        ? (rbtcBackerEstimatedRewards.amount.value * backing) / builderAllocation
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
  }, [totalAllocation, backings, estimatedBuilders, dynamicAllocations])

  const isLoading = estimatedBuildersLoading || totalAllocationLoading || isBackingLoading

  const error = estimatedBuildersError ?? totalAllocationError ?? backingsError ?? null

  const valueOfContext: RewardsContextValue = {
    data,
    isLoading,
    error,
  }

  return <RewardsContext.Provider value={valueOfContext}>{children}</RewardsContext.Provider>
}

export const useRewardsContext = () => useContext(RewardsContext)

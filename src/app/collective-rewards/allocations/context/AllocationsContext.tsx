import {
  useActivatedBuildersWithGauge,
  useBackerTotalAllocation,
  useGetAllAllocationOf,
  useGetVotingPower,
} from '@/app/collective-rewards/allocations/hooks'
import { Builder } from '@/app/collective-rewards/types'
import { useBuilderContext, withBuilderContextProvider } from '@/app/collective-rewards/user'
import { createContext, FC, ReactNode, useEffect, useMemo, useState } from 'react'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { createActions } from './allocationsActions'
export type Allocations = Record<number, bigint>
export interface Backer {
  totalAllocation: bigint
  balance: bigint
  allocationCount: number
  cumulativeAllocation: bigint
}
type AllocationsContextValue = {
  selections: number[]
  allocations: Allocations
  backer: Backer
  isContextLoading: boolean
  contextError: Error | null
  getBuilder: (index: number) => Builder | null
}
export type AllocationsActions = {
  toggleSelectedBuilder: (builderIndex: number) => void
  updateAllocation: (builderIndex: number, value: bigint) => void
  updateAllocations: (values: bigint[]) => void
  updateTotalAllocation: (value: bigint) => void
  resetAllocations: () => void
}
export type InitialState = Pick<AllocationsContextValue, 'backer' | 'allocations'>
type AllocationsContext = {
  initialState: InitialState
  state: AllocationsContextValue
  actions: AllocationsActions
}
const DEFAULT_CONTEXT: AllocationsContext = {
  initialState: {
    backer: {
      balance: BigInt(0),
      totalAllocation: BigInt(0),
      allocationCount: 0,
      cumulativeAllocation: BigInt(0),
    },
    allocations: {},
  },
  state: {
    selections: [],
    allocations: {},
    backer: {
      balance: BigInt(0),
      totalAllocation: BigInt(0),
      allocationCount: 0,
      cumulativeAllocation: BigInt(0),
    },
    isContextLoading: true,
    contextError: null,
    getBuilder: () => null,
  },
  actions: {
    toggleSelectedBuilder: () => {},
    updateAllocation: () => {},
    updateAllocations: () => {},
    updateTotalAllocation: () => {},
    resetAllocations: () => {},
  },
}
export const AllocationsContext = createContext<AllocationsContext>(DEFAULT_CONTEXT)
export const AllocationsContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { address: backerAddress } = useAccount()
  /**
   * Selections are the indexes of the builders that the backer has selected
   */
  const [selections, setSelections] = useState<number[]>(DEFAULT_CONTEXT.state.selections)
  /**
   * Allocations are the amounts that the backer has allocated to each builder either in the current session or in the past
   * The key is the index of the builder
   * The value is the amount allocated
   */
  const [allocations, setAllocations] = useState<Allocations>(DEFAULT_CONTEXT.state.allocations)
  /**
   * Cumulative allocation is the total amount that the backer has allocated to all builders in current session
   */
  const [isContextLoading, setIsContextLoading] = useState(DEFAULT_CONTEXT.state.isContextLoading)
  const [contextError, setContextError] = useState<Error | null>(DEFAULT_CONTEXT.state.contextError)
  const [backer, setBacker] = useState<Backer>(DEFAULT_CONTEXT.state.backer)
  const {
    data: builders,
    isLoading: isLoadingBuilders,
    error: buildersError,
  } = useActivatedBuildersWithGauge()

  console.log('### builders', builders)

  const {
    data: allAllocations,
    isLoading: isAllAllocationsLoading,
    error: allAllocationsError,
  } = useGetAllAllocationOf(
    backerAddress ?? zeroAddress,
    // gauge is always defined here
    builders.map(builder => builder.gauge!),
  )
  const {
    data: totalAllocation,
    isLoading: isTotalAllocationLoading,
    error: totalAllocationError,
  } = useBackerTotalAllocation(backerAddress ?? zeroAddress)
  const { data: votingPower, isLoading: isVotingPowerLoading, error: votingPowerError } = useGetVotingPower()
  useEffect(() => {
    if (isContextLoading) {
      return
    }
    if (!backerAddress || !allAllocations) {
      return
    }
    const [allocations, newCumulativeAllocation] = createInitialAllocations(allAllocations, selections)
    setAllocations(allocations)
    setBacker(prevBacker => ({
      ...prevBacker,
      allocationCount: builders.length,
      cumulativeAllocation: newCumulativeAllocation,
    }))
  }, [allAllocations, backerAddress, selections, isContextLoading, builders.length])
  useEffect(() => {
    if (totalAllocation) {
      setBacker(prevBacker => ({
        ...prevBacker,
        totalAllocation,
      }))
    }
  }, [totalAllocation])
  useEffect(() => {
    if (votingPower) {
      setBacker(prevBacker => ({
        ...prevBacker,
        balance: votingPower,
      }))
    }
  }, [votingPower])
  useEffect(() => {
    setContextError(buildersError ?? allAllocationsError ?? totalAllocationError ?? votingPowerError)
  }, [allAllocationsError, buildersError, totalAllocationError, votingPowerError])
  useEffect(() => {
    setIsContextLoading(
      isLoadingBuilders || isAllAllocationsLoading || isTotalAllocationLoading || isVotingPowerLoading,
    )
  }, [isLoadingBuilders, isAllAllocationsLoading, isTotalAllocationLoading, isVotingPowerLoading])
  const initialState: InitialState = useMemo(() => {
    if (isContextLoading) {
      return {
        backer: DEFAULT_CONTEXT.initialState.backer,
        allocations: DEFAULT_CONTEXT.initialState.allocations,
      }
    }
    const [initialAllocations, initialCumulativeAllocations] = createInitialAllocations(
      allAllocations || [],
      selections,
    )
    return {
      backer: {
        balance: votingPower ?? BigInt(0),
        totalAllocation: totalAllocation ?? BigInt(0),
        allocationCount: builders.length,
        cumulativeAllocation: initialCumulativeAllocations,
      },
      allocations: initialAllocations,
    }
  }, [allAllocations, builders, totalAllocation, votingPower, isContextLoading, selections])
  const state: AllocationsContextValue = {
    selections,
    allocations,
    backer,
    isContextLoading,
    contextError,
    getBuilder: (index: number) => (index >= 0 && index < builders.length ? builders[index] : null),
  }
  const actions: AllocationsActions = useMemo(
    () => createActions(setSelections, setAllocations, setBacker, initialState),
    [initialState],
  )
  return (
    <AllocationsContext.Provider
      value={{
        initialState,
        state,
        actions,
      }}
    >
      {children}
    </AllocationsContext.Provider>
  )
}
function createInitialAllocations(allAllocations: bigint[], selections: number[]): [Allocations, bigint] {
  return allAllocations.reduce(
    (acc, allocation, index) => {
      if (allocation || selections.includes(index)) {
        acc[0][index] = allocation
        acc[1] += allocation
      }
      return acc
    },
    [{} as Allocations, BigInt(0)],
  )
}

export const AllocationsContextProviderWithBuilders = withBuilderContextProvider(AllocationsContextProvider)

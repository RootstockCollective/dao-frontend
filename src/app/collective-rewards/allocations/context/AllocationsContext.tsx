import {
  useActivatedBuildersWithGauge,
  useBackerTotalAllocation,
  useGetAllAllocationOf,
  useGetVotingPower,
} from '@/app/collective-rewards/allocations/hooks'
import { Builder } from '@/app/collective-rewards/types'
import { createContext, FC, ReactNode, useEffect, useMemo, useState, useCallback } from 'react'
import { Address, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { createActions } from './allocationsActions'
import { useBuildersWithBackerRewardPercentage } from '../hooks/useBuildersWithBackerRewardPercentage'
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
  getBuilderIndexByAddress: (address: Address) => number | null
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
    getBuilderIndexByAddress: () => null,
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

  const {
    data: buildersWithBackerRewards,
    isLoading: buildersWithBackerRewardsLoading,
    error: buildersWithBackerRewardsError,
  } = useBuildersWithBackerRewardPercentage(builders)

  const {
    data: allAllocations,
    isLoading: isAllAllocationsLoading,
    error: allAllocationsError,
  } = useGetAllAllocationOf(
    backerAddress ?? zeroAddress,
    // gauge is always defined here
    buildersWithBackerRewards?.map(builder => builder.gauge ?? zeroAddress) || [],
  )
  const {
    data: totalAllocation,
    isLoading: isTotalAllocationLoading,
    error: totalAllocationError,
  } = useBackerTotalAllocation(backerAddress ?? zeroAddress)
  const { data: votingPower, isLoading: isVotingPowerLoading, error: votingPowerError } = useGetVotingPower()

  // Cache builder lookup functions
  const getBuilder = useCallback(
    (index: number) => (index >= 0 && index < builders.length ? builders[index] : null),
    [builders],
  )

  const getBuilderIndexByAddress = useCallback(
    (address: Address) => builders.findIndex(builder => builder.address === address) ?? null,
    [builders],
  )

  // Consolidate state updates
  useEffect(() => {
    if (!isContextLoading && backerAddress && allAllocations) {
      const [newAllocations, newCumulativeAllocation] = createInitialAllocations(allAllocations, selections)
      setAllocations(newAllocations)
      setBacker(prev => ({
        ...prev,
        allocationCount: builders.length,
        cumulativeAllocation: newCumulativeAllocation,
        totalAllocation: totalAllocation ?? prev.totalAllocation,
        balance: votingPower ?? prev.balance,
      }))
    }
  }, [
    allAllocations,
    backerAddress,
    selections,
    isContextLoading,
    builders.length,
    totalAllocation,
    votingPower,
  ])

  useEffect(() => {
    setContextError(
      buildersError ??
        allAllocationsError ??
        totalAllocationError ??
        votingPowerError ??
        buildersWithBackerRewardsError,
    )
  }, [
    allAllocationsError,
    buildersError,
    totalAllocationError,
    votingPowerError,
    buildersWithBackerRewardsError,
  ])
  useEffect(() => {
    setIsContextLoading(
      isLoadingBuilders ||
        isAllAllocationsLoading ||
        isTotalAllocationLoading ||
        isVotingPowerLoading ||
        buildersWithBackerRewardsLoading,
    )
  }, [
    isLoadingBuilders,
    isAllAllocationsLoading,
    isTotalAllocationLoading,
    isVotingPowerLoading,
    buildersWithBackerRewardsLoading,
  ])
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
  const state: AllocationsContextValue = useMemo(
    () => ({
      selections,
      allocations,
      backer,
      isContextLoading,
      contextError,
      getBuilder,
      getBuilderIndexByAddress,
    }),
    [selections, allocations, backer, isContextLoading, contextError, getBuilder, getBuilderIndexByAddress],
  )

  const actions: AllocationsActions = useMemo(
    () => createActions(setSelections, setAllocations, setBacker, initialState),
    [initialState],
  )

  // Cache the context value
  const contextValue = useMemo(
    () => ({
      initialState,
      state,
      actions,
    }),
    [initialState, state, actions],
  )

  return <AllocationsContext.Provider value={contextValue}>{children}</AllocationsContext.Provider>
}
function createInitialAllocations(allAllocations: bigint[], selections: number[]): [Allocations, bigint] {
  return allAllocations.reduce(
    (acc, allocation, index) => {
      if (allocation || selections.includes(index)) {
        acc[0][index] = allocation
        acc[1] += allocation ?? BigInt(0)
      }
      return acc
    },
    [{} as Allocations, BigInt(0)],
  )
}

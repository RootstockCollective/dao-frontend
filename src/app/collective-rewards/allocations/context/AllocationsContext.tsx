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
import { useGetBackerRewards } from '../hooks/useBuildersWithBackerRewardPercentage'

export type Allocations = {
  [K: Address]: bigint
}

export type Builders = {
  [K: Address]: Builder
}

export type Selections = {
  [K: Address]: boolean
}

export interface Backer {
  amountToAllocate: bigint
  balance: bigint
  allocationsCount: number
  cumulativeAllocation: bigint
}

type State = {
  selections: Selections
  allocations: Allocations
  backer: Backer
  isContextLoading: boolean
  contextError: Error | null
  getBuilder: (address: Address) => Builder | null
  isValidState: () => boolean
}

export type AllocationsActions = {
  toggleSelectedBuilder: (address: Address) => void
  updateAllocation: (address: Address, value: bigint) => void
  updateAllocations: (newAllocations: Allocations) => void
  updateAmountToAllocate: (value: bigint) => void
  resetAllocations: () => void
}

export type InitialState = Pick<State, 'backer' | 'allocations'>

type AllocationsContext = {
  initialState: InitialState
  state: State
  actions: AllocationsActions
}

const DEFAULT_CONTEXT: AllocationsContext = {
  initialState: {
    backer: {
      balance: BigInt(0),
      amountToAllocate: BigInt(0),
      allocationsCount: 0,
      cumulativeAllocation: BigInt(0),
    },
    allocations: {},
  },
  state: {
    selections: {},
    allocations: {},
    backer: {
      balance: BigInt(0),
      amountToAllocate: BigInt(0),
      allocationsCount: 0,
      cumulativeAllocation: BigInt(0),
    },
    isContextLoading: true,
    contextError: null,
    getBuilder: () => null,
    isValidState: () => false,
  },
  actions: {
    toggleSelectedBuilder: () => {},
    updateAllocation: () => {},
    updateAllocations: () => {},
    updateAmountToAllocate: () => {},
    resetAllocations: () => {},
  },
}
export const AllocationsContext = createContext<AllocationsContext>(DEFAULT_CONTEXT)
export const AllocationsContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { address: backerAddress } = useAccount()
  /**
   * Context states
   */
  const [selections, setSelections] = useState<Selections>(DEFAULT_CONTEXT.state.selections)
  const [allocations, setAllocations] = useState<Allocations>(DEFAULT_CONTEXT.state.allocations)

  const [isContextLoading, setIsContextLoading] = useState(DEFAULT_CONTEXT.state.isContextLoading)
  const [contextError, setContextError] = useState<Error | null>(DEFAULT_CONTEXT.state.contextError)
  const [backer, setBacker] = useState<Backer>(DEFAULT_CONTEXT.state.backer)

  /**
   * Fetch data from the blockchain
   */
  const { data: votingPower, isLoading: isVotingPowerLoading, error: votingPowerError } = useGetVotingPower()

  const {
    data: rawBuilders,
    isLoading: isLoadingBuilders,
    error: buildersError,
  } = useActivatedBuildersWithGauge()

  const {
    data: backerRewards,
    isLoading: backerRewardsLoading,
    error: backerRewardsError,
  } = useGetBackerRewards(rawBuilders)

  const {
    data: rawAllocations,
    isLoading: isRawAllocationsLoading,
    error: allRawAllocationsError,
  } = useGetAllAllocationOf(rawBuilders, backerAddress)

  const {
    data: totalOnchainAllocation,
    isLoading: isTotalAllocationLoading,
    error: totalAllocationError,
  } = useBackerTotalAllocation(backerAddress)

  const builders: Builders = useMemo(() => {
    if (!rawBuilders || !backerRewards) return {}
    return rawBuilders.reduce((acc, builder, index) => {
      acc[builder.address] = {
        ...builder,
        backerRewardPercentage: {
          active: backerRewards[index]?.active ?? BigInt(0),
          previous: backerRewards[index]?.previous ?? BigInt(0),
          next: backerRewards[index]?.next ?? BigInt(0),
          cooldown: backerRewards[index]?.cooldown ?? BigInt(0),
        },
      }
      return acc
    }, {} as Builders)
  }, [rawBuilders, backerRewards])

  /**
   * Retrieval functions
   */
  const getBuilder = useCallback((address: Address) => builders[address], [builders])

  const isValidState = useCallback(() => {
    const { balance, cumulativeAllocation, amountToAllocate } = backer
    // FIXME: verify that the initial state has changed compared to what we want to save

    return cumulativeAllocation <= balance && amountToAllocate <= balance
  }, [backer])

  /**
   * Reactive state updates
   */
  useEffect(() => {
    if (!isContextLoading && backerAddress && rawAllocations) {
      const [newAllocations, newCumulativeAllocation, allocationsCount] = createInitialAllocations(
        rawAllocations,
        rawBuilders,
        selections,
      )
      setAllocations(newAllocations)
      setBacker(prev => ({
        ...prev,
        allocationsCount,
        cumulativeAllocation: newCumulativeAllocation,
        amountToAllocate: totalOnchainAllocation ?? prev.amountToAllocate,
        balance: votingPower ?? prev.balance,
      }))
    }
  }, [
    rawAllocations,
    backerAddress,
    selections,
    isContextLoading,
    rawBuilders,
    totalOnchainAllocation,
    votingPower,
  ])

  useEffect(() => {
    setContextError(
      buildersError ??
        allRawAllocationsError ??
        totalAllocationError ??
        votingPowerError ??
        backerRewardsError,
    )
  }, [allRawAllocationsError, buildersError, totalAllocationError, votingPowerError, backerRewardsError])
  useEffect(() => {
    setIsContextLoading(
      isLoadingBuilders ||
        isRawAllocationsLoading ||
        isTotalAllocationLoading ||
        isVotingPowerLoading ||
        backerRewardsLoading,
    )
  }, [
    isLoadingBuilders,
    isRawAllocationsLoading,
    isTotalAllocationLoading,
    isVotingPowerLoading,
    backerRewardsLoading,
  ])

  /**
   * Memoize states
   */
  const initialState: InitialState = useMemo(() => {
    if (isContextLoading) {
      return {
        backer: DEFAULT_CONTEXT.initialState.backer,
        allocations: DEFAULT_CONTEXT.initialState.allocations,
      }
    }
    const [initialAllocations, initialCumulativeAllocations, allocationsCount] = createInitialAllocations(
      rawAllocations || [],
      rawBuilders || [],
      selections || {},
    )

    return {
      backer: {
        allocationsCount,
        balance: votingPower ?? BigInt(0),
        amountToAllocate: totalOnchainAllocation ?? BigInt(0),
        allocationCount: Object.entries(initialAllocations).length,
        cumulativeAllocation: initialCumulativeAllocations,
      },
      allocations: initialAllocations,
    }
  }, [rawAllocations, rawBuilders, totalOnchainAllocation, selections, votingPower, isContextLoading])

  const state: State = useMemo(() => {
    return {
      selections,
      allocations,
      backer,
      isContextLoading,
      contextError,
      getBuilder,
      isValidState,
    }
  }, [selections, allocations, backer, isContextLoading, contextError, getBuilder, isValidState])

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

function createInitialAllocations(
  rawAllocations: bigint[],
  rawBuilders: Builder[],
  selections: State['selections'],
): [Allocations, bigint, number] {
  return rawAllocations.reduce(
    (acc, allocation, index) => {
      const builderAddress = rawBuilders[index].address
      if (allocation > 0n || selections[builderAddress]) {
        acc[0][builderAddress] = allocation
        acc[1] += allocation ?? BigInt(0) // cumulative allocation
        acc[2] += 1 // allocations count
      }
      return acc
    },
    [{} as Allocations, BigInt(0), 0],
  )
}

import { useActivatedBuildersWithGauge, useGetVotingPower } from '@/app/collective-rewards/allocations/hooks'
import { Builder } from '@/app/collective-rewards/types'
import { useReadBackersManager, useReadGauges } from '@/shared/hooks/contracts'
import { createContext, FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Address, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { useBuildersWithBackerRewardPercentage } from '../hooks/useBuildersWithBackerRewardPercentage'
import { createActions } from './allocationsActions'
import { validateAllocationsState } from './utils'

export interface Allocations {
  [K: Address]: bigint
}

export interface Builders {
  [K: Address]: Builder
}

export interface Selections {
  [K: Address]: boolean
}

export interface Backer {
  amountToAllocate: bigint
  balance: bigint
  allocationsCount: number
  cumulativeAllocation: bigint
}

interface State {
  resetVersion: number
  selections: Selections
  allocations: Allocations
  backer: Backer
  isContextLoading: boolean
  contextError: Error | null
  getBuilder: (address: Address) => Builder | null
  isValidState: () => boolean
}

export interface AllocationsActions {
  toggleSelectedBuilder: (address: Address) => void
  updateAllocation: (address: Address, value: bigint) => void
  updateAllocations: (newAllocations: Allocations) => void
  updateAmountToAllocate: (value: bigint) => void
  resetAllocations: () => void
}

export type InitialState = Pick<State, 'backer' | 'allocations'>

interface AllocationsContext {
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
    resetVersion: 0,
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
  const [resetVersion, setResetVersion] = useState(DEFAULT_CONTEXT.state.resetVersion)
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

  const gauges = useMemo(() => rawBuilders.map(builder => builder.gauge ?? zeroAddress), [rawBuilders])

  const {
    data: backerRewards,
    isLoading: backerRewardsLoading,
    error: backerRewardsError,
  } = useBuildersWithBackerRewardPercentage(rawBuilders)

  const {
    data: rawAllocations,
    isLoading: isRawAllocationsLoading,
    error: allRawAllocationsError,
  } = useReadGauges(
    {
      addresses: gauges,
      functionName: 'allocationOf',
      args: [backerAddress ?? zeroAddress],
    },
    {
      enabled: !!backerAddress && !!rawBuilders.length,
    },
  )

  const {
    data: totalOnchainAllocation,
    isLoading: isTotalAllocationLoading,
    error: totalAllocationError,
  } = useReadBackersManager(
    {
      functionName: 'backerTotalAllocation',
      args: [backerAddress ?? zeroAddress],
    },
    {
      initialData: 0n,
      enabled: !!backerAddress,
    },
  )

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

  /**
   * Getters
   */
  const getBuilder = useCallback((address: Address) => builders[address], [builders])

  const isValidState = useCallback(
    () =>
      validateAllocationsState({
        backer,
        initialAllocations: initialState.allocations,
        currentAllocations: allocations,
        totalOnchainAllocation: totalOnchainAllocation as bigint,
      }),
    [backer, allocations, totalOnchainAllocation, initialState.allocations],
  )

  const state: State = useMemo(() => {
    return {
      resetVersion,
      selections,
      allocations,
      backer,
      isContextLoading,
      contextError,
      getBuilder,
      isValidState,
    }
  }, [
    selections,
    allocations,
    backer,
    isContextLoading,
    contextError,
    getBuilder,
    isValidState,
    resetVersion,
  ])

  const actions: AllocationsActions = useMemo(
    () => createActions(setResetVersion, setSelections, setAllocations, setBacker, initialState),
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
  rawAllocations: (bigint | undefined)[],
  rawBuilders: Builder[],
  selections: State['selections'],
): [Allocations, bigint, number] {
  return rawAllocations.reduce(
    (acc, rawAllocation, index) => {
      const allocation = rawAllocation ?? 0n
      const builderAddress = rawBuilders[index].address
      if (allocation > 0n || selections[builderAddress]) {
        acc[0][builderAddress] = allocation
        acc[1] += allocation // cumulative allocation
        acc[2] += 1 // allocations count
      }
      return acc
    },
    [{} as Allocations, 0n, 0],
  )
}

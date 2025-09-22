'use client'

import { CommonComponentProps } from '@/components/commonProps'
import { useEffect, useReducer } from 'react'
import { BackingContext, BackingState, initialState } from '.'
import { BackingActionsContext } from './BackingActionsContext'
import { backingReducer } from './backingReducer'
import { filterBuildersByState, useGetBuilders } from '@/app/collective-rewards/user'
import { useGetVotingPower } from '@/app/collective-rewards/allocations/hooks'
import { useReadBackersManager, useReadGauges } from '@/shared/hooks/contracts'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

export const BackingProvider = ({ children }: CommonComponentProps) => {
  const [state, dispatch] = useReducer(backingReducer, initialState)

  const { address: backerAddress } = useAccount()

  /* Get all builders */
  const { data: builders, isLoading: isBuildersLoading, error: buildersError } = useGetBuilders() // FIXME: move builders to props so that we can scope the context better
  const activeBuildersList = builders ? filterBuildersByState(Object.values(builders)) : []

  /* Get backer's balance */
  const { data: stakedBalance, isLoading: isStakedBalanceLoading, error: stakedBalanceError } = useGetVotingPower()

  /* Get backings for each active builder */
  const { data: backings, isLoading: isBackingsLoading, error: backingsError, refetch: refetchBackings } = useReadGauges({
    addresses: builders ? activeBuildersList.map(({ address }) => address) : [], // TODO: check if needs be behind useMemo
    functionName: 'allocationOf',
    args: [backerAddress ?? zeroAddress]
  }, {
    enabled: !!backerAddress && !!activeBuildersList && !!stakedBalance, // FIXME: builders obj might need checking for content. also maybe it should be the filtered builders only
  })

  /* Get backers backing data */ // FIXME: remove if not needed. Could use for veridication of total backing === backings.sum data
  // const {
  //   data: totalBacking,
  //   isLoading: isTotalBackingLoading,
  //   error: totalBackingError,
  // } = useReadBackersManager(
  //   {
  //     functionName: 'backerTotalAllocation',
  //     args: [backerAddress ?? zeroAddress],
  //   },
  //   {
  //     initialData: 0n,
  //     enabled: !!backerAddress,
  //   }
  // )

  /* Set loading state */
  useEffect(() => { dispatch({ type: 'SET_LOADING', payload: isBuildersLoading || isStakedBalanceLoading || isBuildersLoading }) },
    [isBuildersLoading, isStakedBalanceLoading, isBackingsLoading])

  /* Set error state */
  useEffect(() => { dispatch({ type: 'SET_ERROR', payload: buildersError ?? stakedBalanceError ?? backingsError ?? null }) },
    [buildersError, stakedBalanceError])

  /* Set allocations */
  useEffect(() => {
    if (state.isLoading) return // wait until loading is finished

    if (!activeBuildersList || !backings) {
      return // wait until all required data is available
    }

    dispatch({
      type: 'SET_ALL_BACKINGS',
      payload: {
        backings: activeBuildersList.reduce<BackingState['backings']>((acc, { address }, index) => ({
          ...acc,
          [address]: { onchain: backings[index] ?? 0n, pending: 0n }, // makes assumption that all builders are unique
        }), {})
      }
    })
  }, [activeBuildersList, backings, state.isLoading])

  /*  */

  return (
    <BackingContext value={state}>
      <BackingActionsContext value={dispatch}>{children}</BackingActionsContext>
    </BackingContext>
  )
}

export const withBackingContext = (Component: React.ComponentType<CommonComponentProps>) => {
  const WrappedComponent = (props: CommonComponentProps) => {
    return (
      <BackingProvider>
        <Component {...props} />
      </BackingProvider>
    )
  }
  WrappedComponent.displayName = `withBackingContext(${Component.displayName || Component.name || 'Component'})`
  return WrappedComponent
}

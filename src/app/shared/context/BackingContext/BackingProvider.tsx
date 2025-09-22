'use client'

import { useGetVotingPower } from '@/app/collective-rewards/allocations/hooks'
import { filterBuildersByState, useBuilderContext } from '@/app/collective-rewards/user'
import { CommonComponentProps } from '@/components/commonProps'
import { useReadGauges } from '@/shared/hooks/contracts'
import { useEffect, useMemo, useReducer } from 'react'
import { Address, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { BackingContext, BackingState, initialState } from '.'
import { BackingActionsContext } from './BackingActionsContext'
import { backingReducer } from './backingReducer'

type BackingProviderProps = CommonComponentProps & {}

export const BackingProvider = ({ children }: CommonComponentProps) => {
  const [state, dispatch] = useReducer(backingReducer, initialState)

  const { address: backerAddress } = useAccount()

  const { builders, isLoading: isBuildersLoading, error: buildersError } = useBuilderContext()

  /* Get all active builders */
  const activeBuilders = useMemo(() => (builders ? filterBuildersByState(builders) : []), [builders])
  const acitveBuildersGauges = useMemo(
    () => activeBuilders.map(({ gauge }) => gauge as Address),
    [activeBuilders],
  )

  /* Get backer's balance */
  const {
    data: stakedBalance,
    isLoading: isStakedBalanceLoading,
    error: stakedBalanceError,
  } = useGetVotingPower()

  /* Get backings for each active builder */
  const {
    data: onchainBackings,
    isLoading: isOnchainBackingsLoading,
    error: onchainBackingsError,
  } = useReadGauges(
    {
      addresses: acitveBuildersGauges,
      functionName: 'allocationOf',
      args: [backerAddress ?? zeroAddress],
    },
    {
      initialData: [],
      enabled: !!backerAddress && !!acitveBuildersGauges.length,
    },
  )

  useEffect(() => {
    if (state.balance.onchain !== stakedBalance) {
      dispatch({ type: 'SET_ONCHAIN_BALANCE', payload: stakedBalance ?? 0n })
    }
  }, [stakedBalance])

  /* Set loading state */
  useEffect(() => {
    const isLoading = isOnchainBackingsLoading || isStakedBalanceLoading || isBuildersLoading
    if (state.isLoading !== isLoading) {
      dispatch({
        type: 'SET_LOADING',
        payload: isLoading,
      })
    }
  }, [isOnchainBackingsLoading, isStakedBalanceLoading, isBuildersLoading])

  /* Set error state */
  useEffect(() => {
    const error = stakedBalanceError ?? onchainBackingsError ?? buildersError ?? null
    if (state.error === error) {
      dispatch({ type: 'SET_ERROR', payload: error })
    }
  }, [stakedBalanceError, onchainBackingsError, buildersError])

  /* Set allocations */
  useEffect(() => {
    if (state.isLoading) return // wait until loading is finished

    if (!onchainBackings || !onchainBackings.length) {
      return // wait until all required data is available
    }

    if (activeBuilders.some(({ address }, i) => state.backings[address]?.onchain === onchainBackings[i])) {
      return // no changes were made on chain
    }

    dispatch({
      type: 'SET_ALL_BACKINGS',
      payload: activeBuilders.reduce<BackingState['backings']>((acc, { address }, index) => {
        const onchainBacking = onchainBackings[index] ?? 0n
        if (!onchainBacking || onchainBacking === 0n) {
          return acc
        }

        return {
          ...acc,
          [address]: { onchain: onchainBacking, pending: 0n }, // makes (a fair) assumption that all builders are unique and that backings are synced with active builders
        }
      }, {}),
    })
  }, [onchainBackings, activeBuilders])

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

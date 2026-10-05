'use client'
import { produce } from 'immer'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { formatEther } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

import { initialContextState, initialDataState, initialUIState } from '@/app/delegate/lib/constants'
import {
  DelegateContextState,
  DelegateDataState,
  DelegateeState,
  DelegateUIState,
} from '@/app/delegate/lib/types'
import { hasNoOtherDelegatee } from '@/app/user/Delegation/hooks/useGetDelegates'
import { useNftHoldersWithVotingPower } from '@/app/user/Delegation/hooks/useNftHoldersWithVotingPower'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import Big from '@/lib/big'
import { tokenContracts } from '@/lib/contracts'
import { useGetExternalDelegatedAmount } from '@/shared/hooks/useGetExternalDelegatedAmount'

// Context
const DelegateContext = createContext<DelegateContextState>(initialContextState)

// Custom hook to use the context
export const useDelegateContext = (): DelegateContextState => {
  const context = useContext(DelegateContext)
  if (context === undefined) {
    throw new Error('useDelegateContext must be used within a DelegateContextProvider')
  }
  return context
}

interface Props {
  children: ReactNode
}

export const DelegateContextProvider = ({ children }: Props) => {
  const { address } = useAccount()

  // State management with useState and Immer
  const [dataState, setDataState] = useState<DelegateDataState>(initialDataState)
  const [uiState, setUIState] = useState<DelegateUIState>(initialUIState)

  // Fetch delegation data
  const {
    amount: received,
    delegated,
    own,
    available,
    delegationStatus,
    delegateeAddress,
    isLoading,
    delegateeVotingPower,
    delegateeRns,
    refetch: refetchExternalDelegatedAmount,
  } = useGetExternalDelegatedAmount(address)

  // Fetch all delegates to get image data for current delegatee
  const { nftHolders: allDelegates, refetch: refetchAllDelegates } = useNftHoldersWithVotingPower()

  const { data: totalSupply } = useReadContract({
    abi: StRIFTokenAbi,
    address: tokenContracts.stRIF,
    functionName: 'totalSupply',
  })
  // Find current delegatee's data efficiently in a single useMemo
  const getDelegateeData = useCallback(
    (delegateeAddress: string | undefined) => {
      if (!delegateeAddress)
        return {
          imageIpfs: undefined,
          delegatedSince: undefined,
          totalVotes: undefined,
          delegators: undefined,
          votingWeight: undefined,
          votingPower: undefined,
        }

      const delegatee = allDelegates.find(
        delegate => delegate.address.toLowerCase() === delegateeAddress.toLowerCase(),
      )

      // Calculate voting weight as percentage of total supply
      let votingWeight: string | undefined
      const delegateeVotingPower = delegatee?.votingPower?.toString()
      if (delegateeVotingPower && totalSupply) {
        const votingPowerNumber = Big(delegateeVotingPower)
        const totalSupplyNumber = Big(formatEther(totalSupply))
        votingWeight = votingPowerNumber.div(totalSupplyNumber).times(100).toFixed(2) + '%'
      }

      return {
        imageIpfs: delegatee?.imageIpfs,
        delegatedSince: delegatee?.delegatedSince,
        totalVotes: delegatee?.totalVotes,
        delegators: delegatee?.delegators,
        votingWeight,
        votingPower: delegateeVotingPower,
      }
    },
    [allDelegates, totalSupply],
  )

  // Destructure for easier access
  const {
    imageIpfs: delegateeImageIpfs,
    delegatedSince: delegateeDelegatedSince,
    totalVotes: delegateeTotalVotes,
    delegators: delegateeDelegators,
    votingWeight: delegateeVotingWeight,
  } = getDelegateeData(delegateeAddress)

  // Actions
  const setIsDelegationPending = useCallback((isPending: boolean) => {
    setUIState(
      produce(draft => {
        draft.isDelegationPending = isPending
      }),
    )
  }, [])

  const setIsReclaimPending = useCallback((isPending: boolean) => {
    setUIState(
      produce(draft => {
        draft.isReclaimPending = isPending
      }),
    )
  }, [])

  const setNextDelegatee = useCallback(
    (nextDelegatee: DelegateeState | undefined) => {
      setDataState(
        produce(draft => {
          if (nextDelegatee) {
            const knownDelegatee = getDelegateeData(nextDelegatee.address)
            draft.nextDelegatee = {
              ...nextDelegatee,
              ...knownDelegatee,
            }
          } else {
            draft.nextDelegatee = undefined
          }
        }),
      )
    },
    [getDelegateeData],
  )

  const refetch = useCallback(() => {
    // Not awaited: the delegates list comes from an API that can fail, which must not turn a confirmed tx into an error
    refetchAllDelegates().catch(err => console.error('Failed to refresh the delegates list', err))
    return refetchExternalDelegatedAmount()
  }, [refetchExternalDelegatedAmount, refetchAllDelegates])

  // Update data when delegation data changes
  useEffect(() => {
    setDataState(
      produce(draft => {
        draft.cards.received.contentValue = Number(formatEther(received)).toFixed(0)
        draft.cards.own.contentValue = Number(formatEther(own)).toFixed(0)
        draft.cards.delegated.contentValue = Number(formatEther(delegated)).toFixed(0)
        draft.cards.available.contentValue = Number(formatEther(available)).toFixed(0)
        draft.delegationStatus = delegationStatus
        draft.ownStRif = own
        draft.availableVotes = available
        if (delegationStatus === 'other' && delegateeAddress) {
          draft.currentDelegatee = {
            address: delegateeAddress,
            rns: delegateeRns,
            imageIpfs: delegateeImageIpfs,
            delegatedSince: delegateeDelegatedSince,
            totalVotes: delegateeTotalVotes,
            delegators: delegateeDelegators,
            votingWeight: delegateeVotingWeight,
            votingPower: delegateeVotingPower ? formatEther(delegateeVotingPower) : undefined,
          }
        } else {
          draft.currentDelegatee = undefined
        }
      }),
    )
  }, [
    received,
    delegated,
    own,
    available,
    delegationStatus,
    delegateeAddress,
    delegateeRns,
    delegateeImageIpfs,
    delegateeDelegatedSince,
    delegateeTotalVotes,
    delegateeDelegators,
    delegateeVotingWeight,
    delegateeVotingPower,
  ])

  // Update displayed delegatee. A delegate being picked only replaces the current one once its delegation
  // is pending: until then it is shown by the confirmation modal, not as if it had been chosen already.
  useEffect(() => {
    setDataState(
      produce(draft => {
        draft.displayedDelegatee = uiState.isDelegationPending
          ? dataState.nextDelegatee
          : dataState.currentDelegatee
      }),
    )
  }, [dataState.nextDelegatee, dataState.currentDelegatee, uiState.isDelegationPending])

  // Update loading state when UI state changes
  useEffect(() => {
    setDataState(
      produce(draft => {
        // A pending tx only changes these cards when it moves my own voting power: reclaiming it, or
        // delegating it away from myself or for the first time. Derived on every run, so they also stop
        // loading when the delegatee is re-read before the tx flow completes.
        const isMovingMyVotes =
          uiState.isReclaimPending || (uiState.isDelegationPending && hasNoOtherDelegatee(delegationStatus))
        draft.cards.delegated.isLoading = isLoading || isMovingMyVotes
        draft.cards.available.isLoading = isLoading || isMovingMyVotes

        const ownValue = Number(formatEther(own))
        const delegatedValue = Number(formatEther(delegated))
        const availableValue = Number(formatEther(available))

        // content values
        if (uiState.isDelegationPending) {
          // skip updating values if updating delegate
          if (delegationStatus === 'self') {
            draft.cards.delegated.contentValue = ownValue.toFixed(0)
            draft.cards.available.contentValue = (availableValue - ownValue).toFixed(0)
          }
        } else if (uiState.isReclaimPending) {
          draft.cards.delegated.contentValue = '0'
          draft.cards.available.contentValue = (availableValue + delegatedValue).toFixed(0)
        } else {
          draft.cards.delegated.contentValue = delegatedValue.toFixed(0)
          draft.cards.available.contentValue = availableValue.toFixed(0)
        }
      }),
    )
  }, [
    uiState.isDelegationPending,
    uiState.isReclaimPending,
    received,
    delegated,
    own,
    available,
    delegationStatus,
    isLoading,
  ])

  // Update loading state when refetching. Delegated and available also depend on pending txs, so the
  // effect above owns them.
  useEffect(() => {
    setDataState(
      produce(draft => {
        draft.cards.own.isLoading = isLoading
        draft.cards.received.isLoading = isLoading
      }),
    )
  }, [isLoading])

  // Combine state and actions
  const contextValue: DelegateContextState = {
    ...dataState,
    ...uiState,
    setIsDelegationPending,
    setIsReclaimPending,
    setNextDelegatee,
    refetch,
  }

  return <DelegateContext.Provider value={contextValue}>{children}</DelegateContext.Provider>
}

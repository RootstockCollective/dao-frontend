'use client'
import { initialContextState, initialDataState, initialUIState } from '@/app/delegate/lib/constants'
import {
  DelegateContextState,
  DelegateDataState,
  DelegateeState,
  DelegateUIState,
} from '@/app/delegate/lib/types'
import { useNftHoldersWithVotingPower } from '@/app/user/Delegation/hooks/useNftHoldersWithVotingPower'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import Big from '@/lib/big'
import { tokenContracts } from '@/lib/contracts'
import { useGetExternalDelegatedAmount } from '@/shared/hooks/useGetExternalDelegatedAmount'
import { produce } from 'immer'
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Address, formatEther } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

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
    didIDelegateToMyself,
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
  const delegateeData = useCallback(
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
      let votingWeight: string | undefined = undefined
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
  } = delegateeData(delegateeAddress)

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
            const knownDelegatee = delegateeData(nextDelegatee.address)
            if (knownDelegatee) {
              draft.nextDelegatee = {
                ...knownDelegatee,
                address: nextDelegatee.address,
                rns: nextDelegatee.rns,
              }
            } else {
              draft.nextDelegatee = nextDelegatee
            }
          } else {
            draft.nextDelegatee = undefined
          }
        }),
      )
    },
    [delegateeData],
  )

  const refetch = useCallback(() => {
    refetchExternalDelegatedAmount()
    refetchAllDelegates()
  }, [refetchExternalDelegatedAmount, refetchAllDelegates])

  // Update data when delegation data changes
  useEffect(() => {
    setDataState(
      produce(draft => {
        draft.cards.received.contentValue = Number(formatEther(received)).toFixed(0)
        draft.cards.own.contentValue = Number(formatEther(own)).toFixed(0)
        draft.cards.delegated.contentValue = Number(formatEther(delegated)).toFixed(0)
        draft.cards.available.contentValue = Number(formatEther(available)).toFixed(0)
        draft.didIDelegateToMyself = didIDelegateToMyself
        if (delegateeAddress && !didIDelegateToMyself) {
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
    didIDelegateToMyself,
    delegateeAddress,
    delegateeRns,
    delegateeImageIpfs,
    delegateeDelegatedSince,
    delegateeTotalVotes,
    delegateeDelegators,
    delegateeVotingWeight,
    delegateeVotingPower,
  ])

  // Update displayed delegatee
  useEffect(() => {
    setDataState(
      produce(draft => {
        if (uiState.isDelegationPending) {
          draft.displayedDelegatee = dataState.nextDelegatee
        } else if (uiState.isReclaimPending) {
          draft.displayedDelegatee = dataState.currentDelegatee
        } else if (dataState.nextDelegatee) {
          const knownDelegatee = delegateeData(dataState.nextDelegatee.address)
          if (knownDelegatee) {
            draft.displayedDelegatee = {
              ...knownDelegatee,
              address: dataState.nextDelegatee.address,
              rns: dataState.nextDelegatee.rns,
            }
          } else {
            draft.displayedDelegatee = dataState.nextDelegatee
          }
        } else {
          draft.displayedDelegatee = dataState.currentDelegatee
        }
      }),
    )
  }, [
    dataState.nextDelegatee,
    dataState.currentDelegatee,
    uiState.isDelegationPending,
    uiState.isReclaimPending,
    delegateeData,
  ])

  // Update loading state when UI state changes
  useEffect(() => {
    setDataState(
      produce(draft => {
        if (uiState.isReclaimPending || didIDelegateToMyself) {
          // loading states
          draft.cards.delegated.isLoading = uiState.isDelegationPending || uiState.isReclaimPending
          draft.cards.available.isLoading = uiState.isDelegationPending || uiState.isReclaimPending
        }

        const ownValue = Number(formatEther(own))
        const delegatedValue = Number(formatEther(delegated))
        const availableValue = Number(formatEther(available))

        // content values
        if (uiState.isDelegationPending) {
          // skip updating values if updating delegate
          if (didIDelegateToMyself) {
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
    didIDelegateToMyself,
  ])

  // Update loading state when refetching
  useEffect(() => {
    setDataState(
      produce(draft => {
        draft.cards.available.isLoading = isLoading
        draft.cards.own.isLoading = isLoading
        draft.cards.received.isLoading = isLoading
        draft.cards.delegated.isLoading = isLoading
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

'use client'
import { defaultCardsState } from '@/app/delegate/components/constants'
import { DelegateContextState, DelegateDataState, DelegateUIState } from '@/app/delegate/components/types'
import { useGetExternalDelegatedAmount } from '@/shared/hooks/useGetExternalDelegatedAmount'
import { produce } from 'immer'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { formatEther } from 'viem'
import { useAccount } from 'wagmi'

// Initial state
const initialDataState: DelegateDataState = {
  cards: defaultCardsState,
  didIDelegateToMyself: false,
  delegateeAddress: undefined,
}

const initialUIState: DelegateUIState = {
  isDelegationPending: false,
  isReclaimPending: false,
}

// Context
const DelegateContext = createContext<DelegateContextState | undefined>(undefined)

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
  } = useGetExternalDelegatedAmount(address)

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

  // Update data when delegation data changes
  useEffect(() => {
    setDataState(
      produce(draft => {
        draft.cards.received.contentValue = Number(formatEther(received)).toFixed(0)
        draft.cards.own.contentValue = Number(formatEther(own)).toFixed(0)
        draft.cards.delegated.contentValue = Number(formatEther(delegated)).toFixed(0)
        draft.cards.available.contentValue = Number(formatEther(available)).toFixed(0)
        draft.didIDelegateToMyself = didIDelegateToMyself
        draft.delegateeAddress = delegateeAddress
      }),
    )
  }, [received, delegated, own, available, didIDelegateToMyself, delegateeAddress])

  // Update loading state when UI state changes
  useEffect(() => {
    setDataState(
      produce(draft => {
        draft.cards.delegated.isLoading = uiState.isDelegationPending
        draft.cards.own.isLoading = uiState.isReclaimPending
      }),
    )
  }, [uiState.isDelegationPending, uiState.isReclaimPending])

  // Combine state and actions
  const contextValue: DelegateContextState = {
    ...dataState,
    ...uiState,
    setIsDelegationPending,
    setIsReclaimPending,
  }

  return <DelegateContext.Provider value={contextValue}>{children}</DelegateContext.Provider>
}

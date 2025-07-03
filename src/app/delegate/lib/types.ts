/** State to be used by the Context */
import { Address } from 'viem'
import { ReactNode } from 'react'

interface CardState {
  contentValue?: ReactNode | string | undefined
  isLoading?: boolean
}

// Cards state interface
export interface CardsState {
  available: CardState
  own: CardState
  received: CardState
  delegated: CardState
}

// Data state interface
export interface DelegateDataState {
  cards: CardsState
  didIDelegateToMyself: boolean
  delegateeAddress?: Address
}

// UI state interface
export interface DelegateUIState {
  isDelegationPending: boolean
  isReclaimPending: boolean
}

// Actions interface
export interface DelegateActions {
  setIsDelegationPending: (isPending: boolean) => void
  setIsReclaimPending: (isPending: boolean) => void
  refetch: () => void
}

// Combined context state interface
export interface DelegateContextState extends DelegateDataState, DelegateUIState, DelegateActions {}

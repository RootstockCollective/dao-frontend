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
  currentDelegatee?: DelegateeState
  nextDelegatee?: DelegateeState
  displayedDelegatee?: DelegateeState
}

export interface DelegateeState {
  address: Address
  rns?: string
  imageIpfs?: string | null
  delegatedSince?: string
  totalVotes?: number
  delegators?: number
  votingWeight?: string
  votingPower?: string
}

// UI state interface
export interface DelegateUIState {
  isDelegationPending: boolean
  isReclaimPending: boolean
}

// Actions interface
export interface DelegateActions {
  setNextDelegatee: (nextDelegatee: DelegateeState | undefined) => void
  setIsDelegationPending: (isPending: boolean) => void
  setIsReclaimPending: (isPending: boolean) => void
  refetch: () => void
}

// Combined context state interface
export interface DelegateContextState extends DelegateDataState, DelegateUIState, DelegateActions {}

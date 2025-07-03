/** State to be used by the Context */
import { ReactNode } from 'react'

interface CardState {
  contentValue?: ReactNode | undefined
  isLoading?: boolean
}

// Cards state interface
export interface CardsState {
  available: CardState
  own: CardState
  received: CardState
  delegated: CardState
}

// Context state interface (expandable)
export interface DelegateContextState {
  cards: CardsState
  // Add other properties here as needed for expansion
  didIDelegateToMyself: boolean
  delegateeAddress?: string
}

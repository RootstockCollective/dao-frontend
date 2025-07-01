/** State to be used by the Context */

interface CardState {
  contentValue: string | undefined
  isLoading: boolean
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
}

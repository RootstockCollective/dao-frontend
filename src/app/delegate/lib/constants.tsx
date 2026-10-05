import { DelegateActions, DelegateContextState, DelegateDataState, DelegateUIState } from './types'

const defaultCardsState = {
  available: {
    contentValue: '4000',
    isLoading: false,
  },
  own: {
    contentValue: undefined,
    isLoading: false,
  },
  received: {
    contentValue: undefined,
    isLoading: false,
  },
  delegated: {
    contentValue: undefined,
    isLoading: false,
  },
}

// Initial state
export const initialDataState: DelegateDataState = {
  cards: defaultCardsState,
  delegationStatus: undefined,
  ownStRif: 0n,
  currentDelegatee: undefined,
  nextDelegatee: undefined,
  displayedDelegatee: undefined,
}

export const initialUIState: DelegateUIState = {
  isDelegationPending: false,
  isReclaimPending: false,
}

const initialActions: DelegateActions = {
  setIsDelegationPending: () => {},
  setIsReclaimPending: () => {},
  setNextDelegatee: () => {},
  refetch: () => Promise.resolve(),
}

export const initialContextState: DelegateContextState = {
  ...initialDataState,
  ...initialUIState,
  ...initialActions,
}

export const VOTING_POWER_CARDS_INFO = {
  available: {
    title: 'Available',
    tooltipTitle: (
      <>
        This represents: <br /> Voting power delegated to you + your tokens, once you delegate them to
        yourself
      </>
    ),
  },
  own: {
    title: 'Own',
    tooltipTitle: undefined,
  },
  received: {
    title: 'Received',
    tooltipTitle: undefined,
  },
  delegated: {
    title: 'Delegated',
    tooltipTitle: undefined,
  },
}

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
  didIDelegateToMyself: false,
  delegateeAddress: undefined,
  delegateeVotingPower: undefined,
}

export const initialUIState: DelegateUIState = {
  isDelegationPending: false,
  isReclaimPending: false,
}

const initialActions: DelegateActions = {
  setIsDelegationPending: () => {},
  setIsReclaimPending: () => {},
  refetch: () => {},
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
        This represents: <br /> Voting power delegated to you + (your tokens - tokens you delegated to others)
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

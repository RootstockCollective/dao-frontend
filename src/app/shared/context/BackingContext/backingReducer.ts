import { getEnvFlag } from '@/shared/context'
import { Address } from 'viem'
import { BackingAction, BackingActionMap, BackingReducer, BackingState, BacktingActionByType, ChangeableValue } from '.'

const changeBacking = (
  state: BackingState,
  { payload: { builderAddress, backing } }: BacktingActionByType<'CHANGE_BACKING'>,
): BackingState => {
  const newBackings: BackingState['backings'] = {
    ...state.backings,
    [builderAddress]: {
      ...state.backings[builderAddress],
      pending: backing,
    },
  }

  const newTotalBacking: ChangeableValue<bigint> = {
    ...state.totalBacking,
    pending: state.totalBacking.pending - (state.backings[builderAddress]?.pending || 0n) + backing,
  }

  const newBalance: ChangeableValue<bigint> = {
    ...state.balance,
    pending: state.balance.onchain - newTotalBacking.pending,
  }

  return {
    ...state,
    balance: newBalance,
    backings: newBackings,
    totalBacking: newTotalBacking,
    backedBuilderCount: {
      ...state.backedBuilderCount,
      pending: state.backedBuilderCount.pending + (backing === 0n ? -1 : 0),
    },
  }
}

const setAllBackings = (
  state: BackingState,
  { payload: backings }: BacktingActionByType<'SET_ALL_BACKINGS'>,
): BackingState => {
  const { totalBacking, backedBuilderCount } = Object.values(backings).reduce<{
    totalBacking: ChangeableValue<bigint>
    backedBuilderCount: ChangeableValue<number>
  }>(
    (acc, { onchain, pending }) => ({
      totalBacking: {
        onchain: acc.totalBacking.onchain + onchain,
        pending: acc.totalBacking.pending + pending,
      },
      backedBuilderCount: {
        onchain: acc.backedBuilderCount.onchain + 1,
        pending: acc.backedBuilderCount.pending + (pending > 0n ? 1 : 0),
      },
    }),
    {
      totalBacking: { onchain: 0n, pending: 0n },
      backedBuilderCount: { onchain: 0, pending: 0 },
    },
  )

  return {
    ...state,
    totalBacking,
    backedBuilderCount,
    backings,
    balance: {
      ...state.balance,
      pending: state.balance.onchain - totalBacking.pending,
    }
  }
}

const setOnchainBalance = (state: BackingState, { payload }: BacktingActionByType<'SET_ONCHAIN_BALANCE'>): BackingState => {
  return {
    ...state,
    balance: {
      onchain: payload,
      pending: state.balance.pending === 0n ? 0n : state.balance.pending + (payload - state.balance.onchain),
    }
  }
}

const setLoading = (state: BackingState, { payload }: BacktingActionByType<'SET_LOADING'>): BackingState => {
  return {
    ...state,
    isLoading: payload,
  }
}

const setError = (state: BackingState, action: BacktingActionByType<'SET_ERROR'>): BackingState => {
  return {
    ...state,
    error: action.payload,
  }
}

const resetAllBackings = (state: BackingState): BackingState => {
  return {
    ...state,
    backings: Object.entries(state.backings).reduce(
      (acc, [builderAddress, backing]) => ({
        ...acc,
        [builderAddress as Address]: {
          onchain: backing.onchain,
          pending: state.backings[builderAddress as Address]?.onchain ?? 0n,
        },
      }),
      {},
    ),
    totalBacking: {
      ...state.totalBacking,
      pending: 0n
    },
    backedBuilderCount: {
      ...state.backedBuilderCount,
      pending: 0,
    },
    balance: {
      ...state.balance,
      pending: 0n,
    },
  }
}

const ACTION_MAP: BackingActionMap = {
  CHANGE_BACKING: changeBacking,
  SET_ALL_BACKINGS: setAllBackings,
  SET_ONCHAIN_BALANCE: setOnchainBalance,
  RESET_ALL_BACKINGS: resetAllBackings,
  SET_LOADING: setLoading,
  SET_ERROR: setError,
}

export const backingReducer = (state: BackingState, action: BackingAction): BackingState => {
  const debugEnabled = getEnvFlag('debug_logs')
  if (debugEnabled) {
    console.log('action', action)
    console.log('old state', state)
  }

  const actionHandler = ACTION_MAP[action.type] as BackingReducer<BackingAction>

  if (!actionHandler) {
    console.debug(`No action found for type ${action.type}.`)

    return state
  }

  const newState = actionHandler(state, action)
  if (debugEnabled) {
    console.log('new state', newState)
  }

  return newState
}

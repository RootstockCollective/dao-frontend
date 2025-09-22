import { getEnvFlag } from "@/shared/context";
import { BackingAction, BackingActionMap, BackingState, BacktingActionByType, ChangeableValue } from ".";
import { Address } from "viem";
import { number } from "zod";

const toggleSelectedBuilder = (state: BackingState, { payload: { builderAddress } }: BacktingActionByType<'TOGGLE_SELECTED_BUILDER'>): BackingState => {
  return {
    ...state,
    selections: {
      ...state.selections,
      [builderAddress]: !state.selections[builderAddress],
    }
  }
}

const changeBacking = (state: BackingState, { payload: { builderAddress, backing } }: BacktingActionByType<'CHANGE_BACKING'>): BackingState => {
  const newBackings: BackingState['backings'] = {
    ...state.backings,
    [builderAddress]: {
      onchain: state.backings[builderAddress].onchain,
      pending: backing,
    }
  }

  const newTotalBacking: ChangeableValue<bigint> = {
    onchain: state.totalBacking.onchain,
    pending: Object.values(newBackings).reduce((acc, { pending }) => acc + pending, 0n),
  }

  const newBalance: ChangeableValue<bigint> = {
    onchain: state.balance.onchain,
    pending: state.balance.onchain - newTotalBacking.pending,
  }

  return {
    ...state,
    balance: newBalance,
    backings: newBackings,
    totalBacking: newTotalBacking,
    backedBuilderCount: {
      onchain: state.backedBuilderCount.onchain,
      pending: state.backedBuilderCount.pending + (backing > 0n ? 0 : -1)
    }
  }
}

const setAllBackings = (state: BackingState, { payload: { backings } }: BacktingActionByType<'SET_ALL_BACKINGS'>): BackingState => {
  const { totalBacking, backedBuilderCount } = Object.values(backings).reduce<{ totalBacking: ChangeableValue<bigint>, backedBuilderCount: ChangeableValue<number> }>((acc, { onchain, pending }) => ({
    totalBacking: {
      onchain: acc.totalBacking.onchain + onchain,
      pending: acc.totalBacking.pending + pending,
    },
    backedBuilderCount: {
      onchain: acc.backedBuilderCount.onchain + 1,
      pending: acc.backedBuilderCount.pending + (pending > 0n ? 1 : 0),
    }
  }), {
    totalBacking: { onchain: 0n, pending: 0n },
    backedBuilderCount: { onchain: 0, pending: 0 }
  })

  return {
    ...state,
    totalBacking,
    backedBuilderCount,
    backings
  }
}

const setLoading = (state: BackingState, { payload }: BacktingActionByType<'SET_LOADING'>): BackingState => {
  return {
    ...state,
    isLoading: payload,
  }
}

const setError = (state: BackingState, { payload }: BacktingActionByType<'SET_ERROR'>): BackingState => {
  return {
    ...state,
    error: payload,
  }
}

const resetAllBackings = (state: BackingState): BackingState => {
  return {
    ...state,
    backings: Object.entries(state.backings).reduce((acc, [builderAddress, backing]) => ({
      ...acc,
      [builderAddress as Address]: {
        onchain: backing.onchain,
        pending: state.backings[builderAddress as Address]?.onchain ?? 0n,
      }
    }), {})
  }
}

const ACTION_MAP: BackingActionMap = {
  TOGGLE_SELECTED_BUILDER: toggleSelectedBuilder,
  CHANGE_BACKING: changeBacking,
  SET_ALL_BACKINGS: setAllBackings,
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

  const actionHandler = ACTION_MAP[action.type];

  if (!actionHandler) {
    console.debug(`No action found for type ${action.type}.`)

    return state
  }

  const newState = actionHandler(state, (action as { payload: any }).payload)
  if (debugEnabled) {
    console.log('new state', newState)
  }

  return newState
}

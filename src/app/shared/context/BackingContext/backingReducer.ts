import { getEnvFlag } from "@/shared/context";
import { BackingAction, BackingState } from ".";


const ACTION_MAP: Record<BackingAction['type'], <BState extends BackingState>(state: BState, action: BackingAction) => BState> = {
    'SET_SOME_VALUE': (state, action) => {
        if (action.type !== 'SET_SOME_VALUE') return state
        return {
            ...state,
            someValue: action.payload.someValue,
        }
    },
    'RESET': (state, action) => {
        if (action.type !== 'RESET') return state
        return {
            ...state,
            someValue: '',
        }
    },
}

export const backingReducer = <BState extends BackingState>(state: BState, action: BackingAction): BState => {
    const debugEnabled = getEnvFlag('debug_logs')
    if (debugEnabled) {
        console.log('action', action)
        console.log('state', state)
    }

    const newState = ACTION_MAP[action.type]?.(state, action) ?? state
    if (debugEnabled) {
        console.log('newState', newState)
    }

    return newState
}
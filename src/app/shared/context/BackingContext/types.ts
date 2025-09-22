
export type BackingState = {

}


export type BackingAction =
    | { type: 'SET_SOME_VALUE'; payload: { someValue: string } }
    | { type: 'RESET' }
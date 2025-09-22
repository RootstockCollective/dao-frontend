import { Address } from "viem";

export type ChangeableValue<T> = {
  onchain: T
  pending: T
}


export type BackingState = {
  selections: Record<Address, boolean>, // Record<builderAddress, isSelected>
  backings: Record<Address, ChangeableValue<bigint>>, // Reacord<builderAddress, on-chain & pending backingAmount>
  balance: ChangeableValue<bigint> // on-chain & pending balance
  totalBacking: ChangeableValue<bigint> // on-chain & pending total backing across all builders
  backedBuilderCount: ChangeableValue<number> // on-chain & pending count of backed builders
  isLoading: boolean
  error?: Error | null
}

export type BackingAction =
  | { type: 'TOGGLE_SELECTED_BUILDER', payload: { builderAddress: Address } }  // FIXME: @jurajpiar - It would be cleaner to separate selection and allocation
  | { type: 'CHANGE_BACKING', payload: { builderAddress: Address; backing: bigint } }
  | { type: 'SET_ALL_BACKINGS', payload: { backings: BackingState['backings'] } }
  | { type: 'RESET_ALL_BACKINGS' }
  | { type: 'SET_LOADING', payload: boolean }
  | { type: 'SET_ERROR', payload: Error | null }

export type BacktingActionByType<T extends BackingAction['type']> = Extract<BackingAction, { type: T }>

export type BackingReducer<T extends BackingAction> = (
  state: BackingState,
  action: T,
) => BackingState

export type BackingActionMap = {
  [K in BackingAction['type']]: BackingReducer<Extract<BackingAction, { type: K }>>
}

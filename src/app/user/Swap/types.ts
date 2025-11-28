import { Address } from 'viem'

export type SwappingToken = {
  balance: string
  symbol: string
  price: string | undefined
  contract: Address
}

export interface SwapStepProps {
  onGoNext: () => void
  onGoBack: () => void
  onCloseModal: () => void
  onGoToStep: (step: number) => void
  setButtonActions: (actions: ButtonActions) => void
}

// Shared button action types (used across all step components)
export interface ButtonAction {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  isTxPending?: boolean
}

export interface SecondaryButtonAction {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

export interface ButtonActions {
  primary: ButtonAction
  secondary?: SecondaryButtonAction
}

// Expected interface for SwappingContext (to be confirmed when SwappingProvider is merged)
export interface SwappingContextValue {
  amount: string
  onAmountChange: (amount: string) => void
  tokenToSend: SwappingToken
  tokenToReceive: SwappingToken
  amountOut: string // Calculated amount out from swap
  swapPreviewFrom: {
    amount: string
    amountConvertedToCurrency: string
    balance: string
    tokenSymbol: string
  }
  swapPreviewTo: {
    amount: string
    amountConvertedToCurrency: string
    balance: string
    tokenSymbol: string
  }
  buttonActions: ButtonActions
  setButtonActions: (actions: ButtonActions) => void
}

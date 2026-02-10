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

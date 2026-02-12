import { Address } from 'viem'

export interface StakingToken {
  balance: string
  symbol: string
  price: string | undefined
  contract: Address
}

export interface StepProps {
  onGoNext: () => void
  onGoBack: () => void
  onCloseModal: () => void
  onGoToStep: (step: number) => void
}

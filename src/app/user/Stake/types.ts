import { TokenBalance } from '@/app/user/types'
import { Address } from 'viem'

export type StakingToken = TokenBalance & {
  price: string | undefined
  contract: Address
}

export interface StepProps {
  onGoNext: () => void
  onGoBack: () => void
  onCloseModal: () => void
  onGoToStep: (step: number) => void
  actionName: 'STAKE' | 'UNSTAKE'
}

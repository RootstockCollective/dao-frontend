import { STRIF, TokenSymbol } from '@/lib/tokens'
import { Modify } from '@/shared/utility'
import { Address } from 'viem'

export type TokenWithBalance = {
  balance: string
  symbol: TokenSymbol
  price: string | undefined
  contract: Address
}

export type StakingToken = Modify<TokenWithBalance, {
  symbol: typeof STRIF
}>

export interface StepProps {
  onGoNext: () => void
  onGoBack: () => void
  onCloseModal: () => void
  onGoToStep: (step: number) => void
}

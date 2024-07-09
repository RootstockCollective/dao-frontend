import { ReactNode } from 'react'
import { TokenBalance } from '@/app/user/types'

export interface StakePreviewBalanceProps {
  topLeftText: string
  amount: string
  amountConvertedToCurrency: string
  balance: string
  tokenSymbol: string | ReactNode
}

export type StakingToken = TokenBalance & {
  price: string
  contract: string
}

export interface StepProps {
  onGoNext?: () => void
  onGoBack?: () => void
  onCloseModal?: () => void
}

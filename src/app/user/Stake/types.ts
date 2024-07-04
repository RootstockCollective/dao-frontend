import { ReactNode } from 'react'

export interface StakePreviewBalanceProps {
  topLeftText: string
  amount: string
  amountConvertedToCurrency: string
  balance: string
  tokenName: string
  tokenSymbol: string | ReactNode
}

export interface StepProps {
  onGoNext?: () => void
  onGoBack?: () => void
  onCloseModal?: () => void
}

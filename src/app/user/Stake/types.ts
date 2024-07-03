import { ReactNode } from 'react'

export interface StakePreviewBalanceProps {
  topLeftText: string
  amountToSend: string
  amountToSendConverted: string,
  balance: string,
  tokenName: string,
  tokenSymbol: string | ReactNode
}

export interface StepProps {
  onGoNext?: () => void
  onGoBack?: () => void
  onCloseModal?: () => void
}

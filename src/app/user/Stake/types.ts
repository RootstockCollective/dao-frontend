import { ReactNode } from 'react'
import { TokenBalance } from '@/app/user/types'
import { Address } from 'viem'

export interface StakePreviewBalanceProps {
  topLeftText: string
  amount: string
  amountConvertedToCurrency: string
  balance: string
  tokenSymbol: string | ReactNode
}

export type StakingToken = TokenBalance & {
  price: string | undefined
  contract: Address
}

export interface StepProps {
  onGoNext?: () => void
  onGoBack?: () => void
  onCloseModal?: () => void
}

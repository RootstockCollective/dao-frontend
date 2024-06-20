import { ReactNode } from 'react'

interface BalanceRowAction {
  label: string
  onClick: () => void
}

export interface BalanceProps {
  label: string
  amount: string
  icon?: ReactNode
  actions?: BalanceRowAction[]
}

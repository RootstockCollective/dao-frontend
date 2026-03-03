'use client'

import { Button } from '@/components/Button'
import { Tooltip } from '@/components/Tooltip'
import type { ActionEligibility } from '../services/ui/types'
import type { FC } from 'react'

export interface VaultActionButtonsProps {
  eligibility: ActionEligibility
  isConnected: boolean
}

export const VaultActionButtons: FC<VaultActionButtonsProps> = ({ eligibility, isConnected }) => {
  if (!isConnected) return null

  const { canDeposit, canWithdraw, depositBlockReason, withdrawBlockReason } = eligibility

  return (
    <div data-testid="VaultActionButtons" className="flex gap-4">
      <Tooltip text={depositBlockReason} disabled={canDeposit}>
        <Button data-testid="DepositButton" disabled={!canDeposit}>
          Deposit
        </Button>
      </Tooltip>
      <Tooltip text={withdrawBlockReason} disabled={canWithdraw}>
        <Button data-testid="WithdrawButton" disabled={!canWithdraw} variant="secondary">
          Withdraw
        </Button>
      </Tooltip>
    </div>
  )
}

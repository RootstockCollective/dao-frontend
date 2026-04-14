'use client'

import { useCallback } from 'react'

import { formatSymbol } from '@/app/shared/formatter'
import { TransactionStatus } from '@/app/user/Stake/components/TransactionStatus'
import { Button } from '@/components/Button'
import { Divider } from '@/components/Divider'
import { TransactionInProgressButton } from '@/components/StepActionButtons'
import { Label, Paragraph } from '@/components/Typography'

import { BTC_VAULT_WITHDRAW_TWO_TX_MESSAGE } from '../../../services/constants'

interface WithdrawAllowanceStepProps {
  sharesWei: bigint
  isAllowanceReadLoading: boolean
  isApproving: boolean
  isAllowanceTxFailed: boolean
  onRequestAllowance: () => Promise<void>
  onBack: () => void
  /** Human-readable shares (e.g. user input); preferred over dashboard-style formatting for small balances. */
  sharesDisplayAmount?: string
  allowanceTxHash?: string
}

export const WithdrawAllowanceStep = ({
  sharesWei,
  isAllowanceReadLoading,
  isApproving,
  isAllowanceTxFailed,
  onRequestAllowance,
  onBack,
  sharesDisplayAmount,
  allowanceTxHash,
}: WithdrawAllowanceStepProps) => {
  const handlePrimary = useCallback(() => {
    void onRequestAllowance()
  }, [onRequestAllowance])

  const sharesLabel = sharesDisplayAmount ?? formatSymbol(sharesWei, 'ctokenvault')

  return (
    <div className="flex-1 flex flex-col" data-testid="WithdrawAllowanceStep">
      <Paragraph variant="body" className="mb-6 text-text-60">
        {BTC_VAULT_WITHDRAW_TWO_TX_MESSAGE}
      </Paragraph>

      <div className="flex flex-col py-3 px-4 rounded-1 w-full bg-bg-60 mb-8">
        <Label variant="body-s" className="text-text-60 mb-2">
          Shares to approve
        </Label>
        <Label variant="body-l" bold data-testid="AllowanceSharesAmount">
          {sharesLabel}
        </Label>
      </div>

      <TransactionStatus
        txHash={allowanceTxHash}
        isTxFailed={isAllowanceTxFailed}
        failureMessage="Allowance transaction failed."
      />

      <div className="mt-auto pt-4">
        <Divider />
        <div className="flex justify-end items-center gap-3 pt-4">
          <Button
            variant="secondary-outline"
            onClick={onBack}
            disabled={isAllowanceReadLoading || isApproving}
            data-testid="AllowanceBackButton"
            className="min-w-20 whitespace-nowrap"
          >
            Back
          </Button>
          {isApproving ? (
            <TransactionInProgressButton />
          ) : (
            <Button
              variant="primary"
              onClick={handlePrimary}
              disabled={isAllowanceReadLoading || sharesWei <= 0n}
              data-testid="RequestAllowanceButton"
              className="whitespace-nowrap"
            >
              Request allowance
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

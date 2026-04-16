'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Hash } from 'viem'

import { Button } from '@/components/Button'
import { Tooltip } from '@/components/Tooltip'
import { executeTxFlow } from '@/shared/notification'

import { useBtcVaultInvalidation } from '../hooks/useBtcVaultInvalidation'
import { useSubmitDeposit } from '../hooks/useSubmitDeposit'
import { REQUEST_SUBMITTING_REASON } from '../services/constants'
import type { DepositRequestParams } from '../services/types'
import type { ActionEligibility } from '../services/ui/types'
import { BtcDepositModal } from './BtcDepositModal'
import { BtcWithdrawModal } from './BtcWithdrawModal'

export interface BtcVaultActionsProps {
  actionEligibility: ActionEligibility | undefined
  allowance: bigint | undefined
  allowanceTxHash: Hash | undefined
  handleApproveWithdrawShares: (shares: bigint) => Promise<void>
  handleRequestWithdrawRedeem: (shares: bigint) => Promise<void>
  hasAllowanceFor: (amount: bigint) => Promise<boolean>
  isAllowanceReadLoading: boolean
  isAllowanceTxFailed: boolean
  isApprovingShares: boolean
  isWithdrawModalOpen: boolean
  isWithdrawSubmitting: boolean
  onCloseWithdrawModal: () => void
  onOpenWithdrawModal: () => void
  onAnyVaultActionSubmittingChange?: (busy: boolean) => void
  onRequestSubmitted?: () => void
}

export const BtcVaultActions = ({
  actionEligibility,
  allowance,
  allowanceTxHash,
  handleApproveWithdrawShares,
  handleRequestWithdrawRedeem,
  hasAllowanceFor,
  isAllowanceReadLoading,
  isAllowanceTxFailed,
  isApprovingShares,
  isWithdrawModalOpen,
  isWithdrawSubmitting,
  onCloseWithdrawModal,
  onOpenWithdrawModal,
  onAnyVaultActionSubmittingChange,
  onRequestSubmitted,
}: BtcVaultActionsProps) => {
  const { invalidateAfterSubmit } = useBtcVaultInvalidation()

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)

  const {
    onRequestDeposit,
    isRequesting: isDepositRequesting,
    isTxPending: isDepositTxPending,
  } = useSubmitDeposit()

  const canDeposit = actionEligibility?.canDeposit ?? false
  const depositBlockReason = actionEligibility?.depositBlockReason ?? ''
  const canWithdraw = actionEligibility?.canWithdraw ?? false
  const withdrawBlockReason = actionEligibility?.withdrawBlockReason ?? ''

  const isDepositSubmitting = isDepositRequesting || isDepositTxPending

  const isAnySubmitting = isDepositSubmitting || isApprovingShares || isWithdrawSubmitting

  useEffect(() => {
    onAnyVaultActionSubmittingChange?.(isAnySubmitting)
  }, [isAnySubmitting, onAnyVaultActionSubmittingChange])

  const depositDisabled = !canDeposit || isAnySubmitting
  const withdrawDisabled = !canWithdraw || isAnySubmitting

  const depositTooltipText = isAnySubmitting ? REQUEST_SUBMITTING_REASON : depositBlockReason
  const withdrawTooltipText = isAnySubmitting ? REQUEST_SUBMITTING_REASON : withdrawBlockReason

  const handleDepositSubmit = useCallback(
    async (params: DepositRequestParams) => {
      executeTxFlow({
        action: 'btcVaultDepositRequest',
        onRequestTx: () => onRequestDeposit(params.amount),
        onSuccess: () => {
          setIsDepositModalOpen(false)
          invalidateAfterSubmit()
          setTimeout(() => onRequestSubmitted?.(), 1000)
        },
      })
    },
    [onRequestDeposit, invalidateAfterSubmit, onRequestSubmitted],
  )

  return (
    <div data-testid="BtcVaultActionsContent" className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Tooltip text={depositTooltipText} disabled={!depositDisabled || !depositTooltipText}>
          <Button
            variant="primary"
            onClick={() => setIsDepositModalOpen(true)}
            disabled={depositDisabled}
            data-testid="DepositButton"
          >
            Deposit
          </Button>
        </Tooltip>
        <Tooltip text={withdrawTooltipText} disabled={!withdrawDisabled || !withdrawTooltipText}>
          <Button
            variant="primary"
            onClick={onOpenWithdrawModal}
            disabled={withdrawDisabled}
            data-testid="WithdrawButton"
          >
            Withdraw
          </Button>
        </Tooltip>
      </div>

      {isDepositModalOpen && (
        <BtcDepositModal
          onClose={() => setIsDepositModalOpen(false)}
          onSubmit={handleDepositSubmit}
          isSubmitting={isDepositSubmitting}
        />
      )}

      {isWithdrawModalOpen && (
        <BtcWithdrawModal
          onClose={onCloseWithdrawModal}
          hasAllowanceFor={hasAllowanceFor}
          onApproveShares={handleApproveWithdrawShares}
          onRequestWithdraw={handleRequestWithdrawRedeem}
          isApprovingShares={isApprovingShares}
          isWithdrawSubmitting={isWithdrawSubmitting}
          allowance={allowance}
          isAllowanceReadLoading={isAllowanceReadLoading}
          allowanceTxHash={allowanceTxHash}
          isAllowanceTxFailed={isAllowanceTxFailed}
        />
      )}
    </div>
  )
}

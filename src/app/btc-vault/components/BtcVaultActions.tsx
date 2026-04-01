'use client'

import { useCallback, useState } from 'react'
import { useAccount } from 'wagmi'

import { Button } from '@/components/Button'
import { Tooltip } from '@/components/Tooltip'
import { executeTxFlow } from '@/shared/notification'

import { useActionEligibility } from '../hooks/useActionEligibility'
import { useBtcVaultSharesAllowance } from '../hooks/useBtcVaultSharesAllowance'
import { useBtcVaultInvalidation } from '../hooks/useBtcVaultInvalidation'
import { useSubmitDeposit } from '../hooks/useSubmitDeposit'
import { useSubmitWithdrawal } from '../hooks/useSubmitWithdrawal'
import { REQUEST_SUBMITTING_REASON } from '../services/constants'
import type { DepositRequestParams } from '../services/types'
import { BtcDepositModal } from './BtcDepositModal'
import { BtcWithdrawModal } from './BtcWithdrawModal'

export const BtcVaultActions = () => {
  const { address } = useAccount()
  const { data: actionEligibility } = useActionEligibility(address)
  const { invalidateAfterSubmit } = useBtcVaultInvalidation()

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)

  const canDeposit = actionEligibility?.canDeposit ?? false
  const depositBlockReason = actionEligibility?.depositBlockReason ?? ''
  const canWithdraw = actionEligibility?.canWithdraw ?? false
  const withdrawBlockReason = actionEligibility?.withdrawBlockReason ?? ''

  const {
    onRequestDeposit,
    isRequesting: isDepositRequesting,
    isTxPending: isDepositTxPending,
  } = useSubmitDeposit()
  const {
    onRequestRedeem,
    isRequesting: isWithdrawRequesting,
    isTxPending: isWithdrawTxPending,
  } = useSubmitWithdrawal()

  const {
    allowance,
    refetchAllowance,
    isAllowanceReadLoading,
    requestApproveShares,
    hasAllowanceFor,
    isRequesting: isApproveSharesRequesting,
    isTxPending: isApproveSharesTxPending,
    isTxFailed: isAllowanceTxFailed,
    allowanceTxHash,
  } = useBtcVaultSharesAllowance()

  const isApprovingShares = isApproveSharesRequesting || isApproveSharesTxPending
  const isWithdrawSubmitting = isWithdrawRequesting || isWithdrawTxPending

  const isDepositSubmitting = isDepositRequesting || isDepositTxPending
  const isAnySubmitting = isDepositSubmitting || isApprovingShares || isWithdrawSubmitting

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
        },
      })
    },
    [onRequestDeposit, invalidateAfterSubmit],
  )

  const handleApproveWithdrawShares = useCallback(
    async (shares: bigint) => {
      await executeTxFlow({
        action: 'allowance',
        onRequestTx: () => requestApproveShares(shares),
        onSuccess: async () => {
          await refetchAllowance()
        },
      })
    },
    [requestApproveShares, refetchAllowance],
  )

  const handleRequestWithdrawRedeem = useCallback(
    async (shares: bigint) => {
      await executeTxFlow({
        action: 'btcVaultWithdrawRequest',
        onRequestTx: () => onRequestRedeem(shares),
        onSuccess: () => {
          setIsWithdrawModalOpen(false)
          invalidateAfterSubmit()
        },
      })
    },
    [onRequestRedeem, invalidateAfterSubmit],
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
            onClick={() => setIsWithdrawModalOpen(true)}
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
          onClose={() => setIsWithdrawModalOpen(false)}
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

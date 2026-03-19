'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useAccount } from 'wagmi'

import { Button } from '@/components/Button'
import { Tooltip } from '@/components/Tooltip'
import { executeTxFlow } from '@/shared/notification'

import { useActionEligibility } from '../hooks/useActionEligibility'
import { useSubmitDeposit } from '../hooks/useSubmitDeposit'
import { useSubmitWithdrawal } from '../hooks/useSubmitWithdrawal'
import { REQUEST_SUBMITTING_REASON } from '../services/constants'
import type { DepositRequestParams, WithdrawalRequestParams } from '../services/types'
import { BtcDepositModal } from './BtcDepositModal'
import { BtcWithdrawModal } from './BtcWithdrawModal'

export const BtcVaultActions = () => {
  const queryClient = useQueryClient()
  const { address } = useAccount()
  const { data: actionEligibility } = useActionEligibility(address)

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

  const isDepositSubmitting = isDepositRequesting || isDepositTxPending
  const isWithdrawSubmitting = isWithdrawRequesting || isWithdrawTxPending
  const isAnySubmitting = isDepositSubmitting || isWithdrawSubmitting

  const depositDisabled = !canDeposit || isAnySubmitting
  const withdrawDisabled = !canWithdraw || isAnySubmitting

  const depositTooltipText = isAnySubmitting ? REQUEST_SUBMITTING_REASON : depositBlockReason
  const withdrawTooltipText = isAnySubmitting ? REQUEST_SUBMITTING_REASON : withdrawBlockReason

  const invalidateAfterSubmit = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['btc-vault', 'active-requests', address] })
    queryClient.invalidateQueries({ queryKey: ['btc-vault', 'action-eligibility', address] })
  }, [queryClient, address])

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

  const handleWithdrawSubmit = useCallback(
    async (params: WithdrawalRequestParams) => {
      executeTxFlow({
        action: 'btcVaultWithdrawRequest',
        onRequestTx: () => onRequestRedeem(params.amount),
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
          onSubmit={handleWithdrawSubmit}
          isSubmitting={isWithdrawSubmitting}
        />
      )}
    </div>
  )
}

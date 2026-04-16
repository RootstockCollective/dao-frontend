'use client'

import { useCallback, useState } from 'react'

import { executeTxFlow } from '@/shared/notification'

import { BTC_VAULT_BACKEND_INDEX_DELAY_MS } from '../constants'
import { useBtcVaultInvalidation } from './useBtcVaultInvalidation'
import { useBtcVaultSharesAllowance } from './useBtcVaultSharesAllowance'
import { useSubmitWithdrawal } from './useSubmitWithdrawal'

export interface UseBtcVaultWithdrawFlowOptions {
  onRequestSubmitted?: () => void
}

/**
 * Owns the BTC vault withdraw modal, share allowance approval, and redeem request flow.
 * Single instance per dashboard so entry points share one modal and consistent `executeTxFlow` handling.
 */
export function useBtcVaultWithdrawFlow({ onRequestSubmitted }: UseBtcVaultWithdrawFlowOptions = {}) {
  const { invalidateAfterSubmit } = useBtcVaultInvalidation()
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)

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
          setTimeout(() => onRequestSubmitted?.(), BTC_VAULT_BACKEND_INDEX_DELAY_MS)
        },
      })
    },
    [onRequestRedeem, invalidateAfterSubmit, onRequestSubmitted],
  )

  return {
    isWithdrawModalOpen,
    openWithdrawModal: () => setIsWithdrawModalOpen(true),
    closeWithdrawModal: () => setIsWithdrawModalOpen(false),
    handleApproveWithdrawShares,
    handleRequestWithdrawRedeem,
    allowance,
    refetchAllowance,
    isAllowanceReadLoading,
    hasAllowanceFor,
    isApprovingShares,
    isWithdrawSubmitting,
    isAllowanceTxFailed,
    allowanceTxHash,
  }
}

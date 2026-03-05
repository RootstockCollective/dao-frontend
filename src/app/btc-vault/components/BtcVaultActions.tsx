'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'

import { Button } from '@/components/Button'
import { Tooltip } from '@/components/Tooltip'
import { Paragraph } from '@/components/Typography'
import { executeTxFlow } from '@/shared/notification'

import { useActionEligibility } from '../hooks/useActionEligibility'
import { useSubmitDeposit } from '../hooks/useSubmitDeposit'
import { useSubmitWithdrawal } from '../hooks/useSubmitWithdrawal'
import type { DepositRequestParams, WithdrawalRequestParams } from '../services/types'
import { BtcDepositModal } from './BtcDepositModal'
import { BtcWithdrawModal } from './BtcWithdrawModal'

const SUCCESS_BANNER_TIMEOUT_MS = 10_000

export const BtcVaultActions = () => {
  const queryClient = useQueryClient()
  const { address } = useAccount()
  const { data: actionEligibility } = useActionEligibility(address)

  // Deposit state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [showDepositSuccessBanner, setShowDepositSuccessBanner] = useState(false)
  const depositTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Withdraw state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [showWithdrawSuccessBanner, setShowWithdrawSuccessBanner] = useState(false)
  const withdrawTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const invalidateAfterSubmit = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['btc-vault', 'active-requests', address] })
    queryClient.invalidateQueries({ queryKey: ['btc-vault', 'action-eligibility', address] })
  }, [queryClient, address])

  // Deposit handlers
  const handleOpenDepositModal = useCallback(() => {
    setShowDepositSuccessBanner(false)
    setIsDepositModalOpen(true)
  }, [])

  const handleCloseDepositModal = useCallback(() => {
    setIsDepositModalOpen(false)
  }, [])

  const handleDepositSubmit = useCallback(
    async (params: DepositRequestParams) => {
      const slippagePercentage = (params.slippage ?? 0.005) * 100
      executeTxFlow({
        action: 'btcVaultDepositRequest',
        onRequestTx: () => onRequestDeposit(params.amount, slippagePercentage),
        onSuccess: () => {
          setIsDepositModalOpen(false)
          setShowDepositSuccessBanner(true)
          invalidateAfterSubmit()
          depositTimerRef.current = setTimeout(() => {
            setShowDepositSuccessBanner(false)
          }, SUCCESS_BANNER_TIMEOUT_MS)
        },
      })
    },
    [onRequestDeposit, invalidateAfterSubmit],
  )

  // Withdraw handlers
  const handleOpenWithdrawModal = useCallback(() => {
    setShowWithdrawSuccessBanner(false)
    setIsWithdrawModalOpen(true)
  }, [])

  const handleCloseWithdrawModal = useCallback(() => {
    setIsWithdrawModalOpen(false)
  }, [])

  const handleWithdrawSubmit = useCallback(
    async (params: WithdrawalRequestParams) => {
      const slippagePercentage = (params.slippage ?? 0.005) * 100
      executeTxFlow({
        action: 'btcVaultWithdrawRequest',
        onRequestTx: () => onRequestRedeem(params.amount, slippagePercentage),
        onSuccess: () => {
          setIsWithdrawModalOpen(false)
          setShowWithdrawSuccessBanner(true)
          invalidateAfterSubmit()
          withdrawTimerRef.current = setTimeout(() => {
            setShowWithdrawSuccessBanner(false)
          }, SUCCESS_BANNER_TIMEOUT_MS)
        },
      })
    },
    [onRequestRedeem, invalidateAfterSubmit],
  )

  const dismissBanners = useCallback(() => {
    setShowDepositSuccessBanner(false)
    setShowWithdrawSuccessBanner(false)
    if (depositTimerRef.current) {
      clearTimeout(depositTimerRef.current)
      depositTimerRef.current = null
    }
    if (withdrawTimerRef.current) {
      clearTimeout(withdrawTimerRef.current)
      withdrawTimerRef.current = null
    }
  }, [])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (depositTimerRef.current) clearTimeout(depositTimerRef.current)
      if (withdrawTimerRef.current) clearTimeout(withdrawTimerRef.current)
    }
  }, [])

  const scrollTo = useCallback(
    (testId: string) => {
      dismissBanners()
      document.querySelector(`[data-testid="${testId}"]`)?.scrollIntoView({ behavior: 'smooth' })
    },
    [dismissBanners],
  )

  return (
    <div data-testid="BtcVaultActionsContent" className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Tooltip text={depositBlockReason} disabled={canDeposit || !depositBlockReason}>
          <Button
            variant="primary"
            onClick={handleOpenDepositModal}
            disabled={!canDeposit}
            data-testid="DepositButton"
          >
            Deposit
          </Button>
        </Tooltip>
        <Tooltip text={withdrawBlockReason} disabled={canWithdraw || !withdrawBlockReason}>
          <Button
            variant="primary"
            onClick={handleOpenWithdrawModal}
            disabled={!canWithdraw}
            data-testid="WithdrawButton"
          >
            Withdraw
          </Button>
        </Tooltip>
      </div>

      {showDepositSuccessBanner && (
        <div
          className="flex flex-col gap-2 p-4 rounded-1 bg-st-success/10 border border-st-success"
          data-testid="DepositSuccessBanner"
        >
          <Paragraph variant="body-s" className="font-bold text-st-success">
            Deposit request submitted
          </Paragraph>
          <Paragraph variant="body-s" className="text-text-60">
            Pending Fund Manager approval
          </Paragraph>
          <div className="flex gap-3 mt-1">
            <Button
              variant="secondary"
              onClick={() => scrollTo('btc-vault-request-queue')}
              data-testid="ViewRequestStatusCTA"
            >
              View request status
            </Button>
            <Button
              variant="secondary"
              onClick={() => scrollTo('btc-vault-dashboard')}
              data-testid="GoToPositionCTA"
            >
              Go to My Position
            </Button>
          </div>
        </div>
      )}

      {showWithdrawSuccessBanner && (
        <div
          className="flex flex-col gap-2 p-4 rounded-1 bg-st-success/10 border border-st-success"
          data-testid="WithdrawSuccessBanner"
        >
          <Paragraph variant="body-s" className="font-bold text-st-success">
            Withdrawal request submitted
          </Paragraph>
          <Paragraph variant="body-s" className="text-text-60">
            Pending Fund Manager processing
          </Paragraph>
          <div className="flex gap-3 mt-1">
            <Button
              variant="secondary"
              onClick={() => scrollTo('btc-vault-request-queue')}
              data-testid="WithdrawViewRequestStatusCTA"
            >
              View request status
            </Button>
            <Button
              variant="secondary"
              onClick={() => scrollTo('btc-vault-dashboard')}
              data-testid="WithdrawGoToPositionCTA"
            >
              Go to My Position
            </Button>
          </div>
        </div>
      )}

      {isDepositModalOpen && (
        <BtcDepositModal
          onClose={handleCloseDepositModal}
          onSubmit={handleDepositSubmit}
          isSubmitting={isDepositSubmitting}
        />
      )}

      {isWithdrawModalOpen && (
        <BtcWithdrawModal
          onClose={handleCloseWithdrawModal}
          onSubmit={handleWithdrawSubmit}
          isSubmitting={isWithdrawSubmitting}
        />
      )}
    </div>
  )
}

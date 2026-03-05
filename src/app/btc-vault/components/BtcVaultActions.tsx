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
import type { DepositRequestParams } from '../services/types'
import { BtcDepositModal } from './BtcDepositModal'

const SUCCESS_BANNER_TIMEOUT_MS = 10_000

export const BtcVaultActions = () => {
  const queryClient = useQueryClient()
  const { address } = useAccount()
  const { data: actionEligibility } = useActionEligibility(address)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const canDeposit = actionEligibility?.canDeposit ?? false
  const depositBlockReason = actionEligibility?.depositBlockReason ?? ''

  const { onRequestDeposit, isRequesting, isTxPending } = useSubmitDeposit()

  const isSubmitting = isRequesting || isTxPending

  const handleOpenModal = useCallback(() => {
    setShowSuccessBanner(false)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const dismissSuccessBanner = useCallback(() => {
    setShowSuccessBanner(false)
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }
  }, [])

  const handleSubmit = useCallback(
    async (params: DepositRequestParams) => {
      executeTxFlow({
        action: 'btcVaultDepositRequest',
        onRequestTx: () => onRequestDeposit(params.amount),
        onSuccess: () => {
          setIsModalOpen(false)
          setShowSuccessBanner(true)
          queryClient.invalidateQueries({ queryKey: ['btc-vault', 'active-requests', address] })
          queryClient.invalidateQueries({ queryKey: ['btc-vault', 'action-eligibility', address] })
          successTimerRef.current = setTimeout(() => {
            setShowSuccessBanner(false)
          }, SUCCESS_BANNER_TIMEOUT_MS)
        },
      })
    },
    [onRequestDeposit, queryClient, address],
  )

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
      }
    }
  }, [])

  const scrollTo = useCallback(
    (testId: string) => {
      dismissSuccessBanner()
      document.querySelector(`[data-testid="${testId}"]`)?.scrollIntoView({ behavior: 'smooth' })
    },
    [dismissSuccessBanner],
  )

  return (
    <div data-testid="BtcVaultActionsContent" className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Tooltip text={depositBlockReason} disabled={canDeposit || !depositBlockReason}>
          <Button
            variant="primary"
            onClick={handleOpenModal}
            disabled={!canDeposit}
            data-testid="DepositButton"
          >
            Deposit
          </Button>
        </Tooltip>
      </div>

      {showSuccessBanner && (
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

      {isModalOpen && (
        <BtcDepositModal onClose={handleCloseModal} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      )}
    </div>
  )
}

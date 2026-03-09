'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useAccount } from 'wagmi'

import { Button } from '@/components/Button'
import { Tooltip } from '@/components/Tooltip'
import { executeTxFlow } from '@/shared/notification'

import { useActionEligibility } from '../hooks/useActionEligibility'
import { useSubmitDeposit } from '../hooks/useSubmitDeposit'
import type { DepositRequestParams } from '../services/types'
import { BtcDepositModal } from './BtcDepositModal'

export const BtcVaultActions = () => {
  const queryClient = useQueryClient()
  const { address } = useAccount()
  const { data: actionEligibility } = useActionEligibility(address)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const canDeposit = actionEligibility?.canDeposit ?? false
  const depositBlockReason = actionEligibility?.depositBlockReason ?? ''

  const { onRequestDeposit, isRequesting, isTxPending } = useSubmitDeposit()

  const isSubmitting = isRequesting || isTxPending

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleSubmit = useCallback(
    async (params: DepositRequestParams) => {
      executeTxFlow({
        action: 'btcVaultDepositRequest',
        onRequestTx: () => onRequestDeposit(params.amount),
        onSuccess: () => {
          setIsModalOpen(false)
          queryClient.invalidateQueries({ queryKey: ['btc-vault', 'active-requests', address] })
          queryClient.invalidateQueries({ queryKey: ['btc-vault', 'action-eligibility', address] })
        },
      })
    },
    [onRequestDeposit, queryClient, address],
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

      {isModalOpen && (
        <BtcDepositModal onClose={handleCloseModal} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      )}
    </div>
  )
}

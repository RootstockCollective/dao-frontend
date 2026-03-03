'use client'

import { useCallback, useState } from 'react'
import { useAccount } from 'wagmi'

import { Button } from '@/components/Button'
import { Tooltip } from '@/components/Tooltip'

import { useActionEligibility } from '../hooks/useActionEligibility'
import type { DepositRequestParams } from '../services/types'
import { BtcDepositModal } from './BtcDepositModal'

export const BtcVaultActions = () => {
  const { address } = useAccount()
  const { data: actionEligibility } = useActionEligibility(address)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const canDeposit = actionEligibility?.canDeposit ?? false
  const depositBlockReason = actionEligibility?.depositBlockReason ?? ''

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleSubmit = useCallback(async (_params: DepositRequestParams) => {
    // Contract call wired in STORY-BTC-DEPOSIT-002
  }, [])

  return (
    <div data-testid="BtcVaultActionsContent" className="flex gap-4">
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

      {isModalOpen && (
        <BtcDepositModal onClose={handleCloseModal} onSubmit={handleSubmit} isSubmitting={false} />
      )}
    </div>
  )
}

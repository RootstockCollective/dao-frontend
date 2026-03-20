'use client'

import { useCallback, useEffect } from 'react'
import { Address, parseEther } from 'viem'

import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { shortAddress } from '@/lib/utils'
import { executeTxFlow } from '@/shared/notification'

import { ConfirmationDetail } from '../../../components/ConfirmationDetail'
import { FlowStepProps } from '../../../types'
import { useTransferToManager } from '../hooks/useTransferToManager'
import { useTransferToManagerContext } from '../TransferToManagerContext'

export const ConfirmTransferStep = ({ onGoToStep, onCloseModal, setButtonActions }: FlowStepProps) => {
  const { amount, selectedToken, isNative, usdEquivalent, recipientAddress } = useTransferToManagerContext()
  const amountWei = parseEther(amount)
  const { onRequestTransaction, isRequesting, isTxPending } = useTransferToManager(
    amountWei,
    isNative,
    recipientAddress as Address,
  )

  const handleConfirm = useCallback(() => {
    executeTxFlow({
      onRequestTx: onRequestTransaction,
      onSuccess: onCloseModal,
      action: 'transfer',
    })
  }, [onRequestTransaction, onCloseModal])

  useEffect(() => {
    setButtonActions({
      primary: {
        label: isRequesting ? 'Signing...' : 'Sign & propose transaction',
        onClick: handleConfirm,
        disabled: !amount || Number(amount) <= 0,
        loading: isRequesting,
        isTxPending,
      },
      secondary: {
        label: 'Back',
        onClick: () => onGoToStep(0),
      },
    })
  }, [amount, handleConfirm, isRequesting, isTxPending, onGoToStep, setButtonActions])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-10">
      <ConfirmationDetail label="Recipient address" value={shortAddress(recipientAddress as Address, 6)} />
      <ConfirmationDetail
        label="Amount to transfer"
        value={amount}
        secondaryValue={usdEquivalent}
        icon={
          <div className="flex items-center gap-1 shrink-0 pl-2">
            <TokenImage symbol={RBTC} size={24} />
            <Span variant="body-l" bold>
              {selectedToken}
            </Span>
          </div>
        }
      />
    </div>
  )
}

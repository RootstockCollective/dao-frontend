'use client'

import { useCallback, useEffect } from 'react'
import { parseEther } from 'viem'

import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { buffer } from '@/lib/contracts'
import { shortAddress } from '@/lib/utils'
import { executeTxFlow } from '@/shared/notification'

import { ConfirmationDetail } from '../../../components/ConfirmationDetail'
import { FlowStepProps } from '../../../types'
import { useTopUpBuffer } from '../hooks/useTopUpBuffer'
import { useTopUpBufferContext } from '../TopUpBufferContext'

export const ConfirmDepositStep = ({ onGoToStep, onCloseModal, setButtonActions }: FlowStepProps) => {
  const { amount, selectedToken, isNative, usdEquivalent } = useTopUpBufferContext()
  const { onInject, onInjectNative } = useTopUpBuffer()

  const handleConfirm = useCallback(() => {
    const amountWei = parseEther(amount)
    executeTxFlow({
      onRequestTx: () => (isNative ? onInjectNative(amountWei) : onInject(amountWei)),
      onSuccess: onCloseModal,
      action: 'bufferTopUp',
    })
  }, [amount, isNative, onInject, onInjectNative, onCloseModal])

  useEffect(() => {
    setButtonActions({
      primary: {
        label: 'Sign & propose transaction',
        onClick: handleConfirm,
        disabled: !amount || Number(amount) <= 0,
      },
      secondary: {
        label: 'Back',
        onClick: () => onGoToStep(0),
      },
    })
  }, [amount, handleConfirm, onGoToStep, setButtonActions])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-10">
      <ConfirmationDetail label="Recipient address" value={shortAddress(buffer.address, 6)} />
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

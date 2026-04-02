'use client'

import { useCallback, useEffect } from 'react'
import { Address, Hash } from 'viem'

import { ConfirmationDetail } from '@/app/fund-manager/components'
import { FlowStepProps } from '@/app/fund-manager/types'
import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { shortAddress } from '@/lib/utils'
import { executeTxFlow } from '@/shared/notification'
import { TX_MESSAGES } from '@/shared/txMessages'

import { AmountFlowContextValue } from './createAmountFlowContext'

interface TransactionResult {
  onRequestTransaction: () => Promise<Hash>
  isRequesting: boolean
  isTxPending: boolean
}

interface CreateConfirmStepConfig<TContext extends AmountFlowContextValue> {
  useFlowContext: () => TContext
  useTransaction: (context: TContext) => TransactionResult
  actionName: keyof typeof TX_MESSAGES
  getRecipientAddress: (context: TContext) => Address
}

export const createConfirmStep = <TContext extends AmountFlowContextValue>({
  useFlowContext,
  useTransaction,
  actionName,
  getRecipientAddress,
}: CreateConfirmStepConfig<TContext>) => {
  const ConfirmStep = ({ onGoToStep, onCloseModal, setButtonActions }: FlowStepProps) => {
    const context = useFlowContext()
    const { amount, selectedToken, isNative, usdEquivalent } = context
    const { onRequestTransaction, isRequesting, isTxPending } = useTransaction(context)
    const recipientAddress = getRecipientAddress(context)

    const confirmBackStepIndex = isNative ? 0 : 1

    const handleConfirm = useCallback(() => {
      executeTxFlow({
        onRequestTx: onRequestTransaction,
        onSuccess: onCloseModal,
        action: actionName,
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
          onClick: () => onGoToStep(confirmBackStepIndex),
        },
      })
    }, [amount, confirmBackStepIndex, handleConfirm, isRequesting, isTxPending, onGoToStep, setButtonActions])

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-10">
        <ConfirmationDetail label="Recipient address" value={shortAddress(recipientAddress, 6)} />
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
  return ConfirmStep
}

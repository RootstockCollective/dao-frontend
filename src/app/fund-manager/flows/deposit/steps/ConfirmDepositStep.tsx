'use client'

import { useCallback, useEffect } from 'react'
import { parseEther } from 'viem'

import { TokenImage } from '@/components/TokenImage'
import { Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { rbtcVault } from '@/lib/contracts'
import { shortAddress } from '@/lib/utils'
import { executeTxFlow } from '@/shared/notification'

import { ConfirmationDetail } from '../../../components/ConfirmationDetail'
import { FlowStepProps } from '../../../types'
import { useDepositToVaultContext } from '../DepositToVaultContext'
import { useDepositToVault } from '../hooks/useDepositToVault'

export const ConfirmDepositStep = ({ onGoToStep, onCloseModal, setButtonActions }: FlowStepProps) => {
  const { amount, selectedToken, isNative, usdEquivalent } = useDepositToVaultContext()
  const amountWei = parseEther(amount)
  const { onRequestTransaction, isRequesting, isTxPending } = useDepositToVault(amountWei, isNative)

  const confirmBackStepIndex = isNative ? 0 : 1

  const handleConfirm = useCallback(() => {
    executeTxFlow({
      onRequestTx: onRequestTransaction,
      onSuccess: onCloseModal,
      action: 'vaultDeposit',
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
      <ConfirmationDetail label="Recipient address" value={shortAddress(rbtcVault.address, 6)} />
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

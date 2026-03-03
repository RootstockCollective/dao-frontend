'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

import { DEFAULT_SLIPPAGE_PERCENTAGE } from '@/app/vault/utils/slippage'
import { Divider } from '@/components/Divider'
import { Modal } from '@/components/Modal'
import { Header } from '@/components/Typography'

import { useUserPosition } from '../hooks/useUserPosition'
import type { DepositRequestParams } from '../services/types'
import { DepositAmountStep } from './DepositAmountStep'

type DepositStep = 'amount' | 'review'

interface BtcDepositModalProps {
  onClose: () => void
  onSubmit: (params: DepositRequestParams) => Promise<void>
  isSubmitting: boolean
}

export const BtcDepositModal = ({
  onClose,
  onSubmit: _onSubmit,
  isSubmitting: _isSubmitting,
}: BtcDepositModalProps) => {
  const { address } = useAccount()
  const { data: userPosition } = useUserPosition(address)

  const [step, setStep] = useState<DepositStep>('amount')
  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE_PERCENTAGE.toString())

  const rbtcBalanceFormatted = userPosition?.rbtcBalanceFormatted ?? '0'
  const rbtcBalanceRaw = userPosition?.rbtcBalanceRaw ?? 0n

  const handleNext = () => {
    setStep('review')
  }

  return (
    <Modal onClose={onClose} data-testid="BtcDepositModal">
      <div className="h-full flex flex-col p-4 md:p-6">
        <Header className="mt-16 mb-4">{step === 'amount' ? 'DEPOSIT rBTC' : 'REVIEW DEPOSIT'}</Header>
        <Divider className="mb-4" />

        {step === 'amount' && (
          <DepositAmountStep
            amount={amount}
            setAmount={setAmount}
            slippage={slippage}
            setSlippage={setSlippage}
            rbtcBalanceFormatted={rbtcBalanceFormatted}
            rbtcBalanceRaw={rbtcBalanceRaw}
            onNext={handleNext}
          />
        )}

        {step === 'review' && (
          <div data-testid="DepositReviewStep">{/* Review step implemented in Phase 2 */}</div>
        )}
      </div>
    </Modal>
  )
}

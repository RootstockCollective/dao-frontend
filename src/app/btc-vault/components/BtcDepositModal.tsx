'use client'

import { useCallback, useMemo, useState } from 'react'
import { formatEther, parseEther } from 'viem'
import { useAccount } from 'wagmi'

import { Modal } from '@/components/Modal'
import { ProgressBar } from '@/components/ProgressBarNew'
import { Header } from '@/components/Typography'

import { useUserPosition } from '../hooks/useUserPosition'
import { useVaultMetrics } from '../hooks/useVaultMetrics'
import { BTC_VAULT_DEPOSIT_FEE, DEPOSIT_STEP_PROGRESS } from '../services/constants'
import type { DepositRequestParams } from '../services/types'
import { DepositAmountStep } from './DepositAmountStep'
import { DepositReviewStep } from './DepositReviewStep'
import { DepositSteps } from './DepositSteps'

type DepositStep = 'amount' | 'review'

const STEP_INDEX: Record<DepositStep, number> = { amount: 0, review: 1 }

interface BtcDepositModalProps {
  onClose: () => void
  onSubmit: (params: DepositRequestParams) => Promise<void>
  isSubmitting: boolean
}

export const BtcDepositModal = ({ onClose, onSubmit, isSubmitting }: BtcDepositModalProps) => {
  const { address } = useAccount()
  const { data: userPosition } = useUserPosition(address)
  const { data: vaultMetrics } = useVaultMetrics()

  const [step, setStep] = useState<DepositStep>('amount')
  const [amount, setAmount] = useState('')

  const rbtcBalanceFormatted = userPosition?.rbtcBalanceFormatted ?? '0'
  const rbtcBalanceRaw = userPosition?.rbtcBalanceRaw ?? 0n

  const navFormatted = vaultMetrics?.navFormatted ?? '0'
  const navRaw = vaultMetrics?.navRaw ?? 0n

  const estimatedShares = useMemo(() => {
    if (!amount || navRaw === 0n) return '0'
    try {
      const amountWei = parseEther(amount)
      const sharesWei = (amountWei * 10n ** 18n) / navRaw
      return formatEther(sharesWei)
    } catch {
      return '0'
    }
  }, [amount, navRaw])

  const handleNext = () => setStep('review')
  const handleBack = () => setStep('amount')

  const handleSubmit = useCallback(() => {
    if (!amount) return
    try {
      const amountWei = parseEther(amount)
      onSubmit({ amount: amountWei })
    } catch {
      // parseEther may throw on invalid input — noop
    }
  }, [amount, onSubmit])

  const stepIndex = STEP_INDEX[step]

  return (
    <Modal onClose={onClose} data-testid="BtcDepositModal">
      <div className="h-full flex flex-col p-4 md:p-6">
        <Header className="mt-16 mb-4">DEPOSIT RBTC</Header>

        <div className="mb-12">
          <DepositSteps currentStep={stepIndex} />
          <ProgressBar progress={DEPOSIT_STEP_PROGRESS[stepIndex]} className="mt-3" />
        </div>

        {step === 'amount' && (
          <DepositAmountStep
            amount={amount}
            setAmount={setAmount}
            rbtcBalanceFormatted={rbtcBalanceFormatted}
            rbtcBalanceRaw={rbtcBalanceRaw}
            estimatedShares={estimatedShares}
            depositFee={BTC_VAULT_DEPOSIT_FEE}
            onNext={handleNext}
          />
        )}

        {step === 'review' && (
          <DepositReviewStep
            amount={amount}
            estimatedShares={estimatedShares}
            navFormatted={navFormatted}
            depositFee={BTC_VAULT_DEPOSIT_FEE}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </Modal>
  )
}

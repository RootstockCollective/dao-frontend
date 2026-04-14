'use client'

import { useCallback, useMemo, useState } from 'react'
import { formatUnits, parseEther } from 'viem'
import { useAccount } from 'wagmi'

import { Modal } from '@/components/Modal'
import { ProgressBar } from '@/components/ProgressBarNew'
import { Header } from '@/components/Typography'
import { VAULT_SHARE_DECIMALS } from '@/lib/constants'

import { useUserPosition } from '../../../hooks/useUserPosition'
import { useVaultMetrics } from '../../../hooks/useVaultMetrics'
import { BTC_VAULT_DEPOSIT_FEE, DEPOSIT_STEP_PROGRESS } from '../../../services/constants'
import type { DepositRequestParams } from '../../../services/types'
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

  // Chain spot NAV per raw share basis — pairs with raw `sharesWei` in estimates (see `VaultMetrics.pricePerShare`).
  const pricePerShareRaw = vaultMetrics?.pricePerShareRaw ?? 0n

  const estimatedShares = useMemo(() => {
    if (!amount || pricePerShareRaw === 0n) return '0'
    try {
      const amountWei = parseEther(amount)
      const sharesWei = (amountWei * 10n ** 18n) / pricePerShareRaw
      return formatUnits(sharesWei, VAULT_SHARE_DECIMALS)
    } catch {
      return '0'
    }
  }, [amount, pricePerShareRaw])

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

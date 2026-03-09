'use client'

import { useCallback, useMemo, useState } from 'react'
import { formatEther, parseEther } from 'viem'
import { useAccount } from 'wagmi'

import { Modal } from '@/components/Modal'
import { ProgressBar } from '@/components/ProgressBarNew'
import { Header } from '@/components/Typography'

import { useUserPosition } from '../hooks/useUserPosition'
import { useVaultMetrics } from '../hooks/useVaultMetrics'
import { BTC_VAULT_WITHDRAWAL_FEE, WITHDRAWAL_STEP_PROGRESS } from '../services/constants'
import type { WithdrawalRequestParams } from '../services/types'
import { WithdrawAmountStep } from './WithdrawAmountStep'
import { WithdrawReviewStep } from './WithdrawReviewStep'
import { WithdrawSteps } from './WithdrawSteps'

type WithdrawStep = 'amount' | 'review'

const STEP_INDEX: Record<WithdrawStep, number> = { amount: 0, review: 1 }

interface BtcWithdrawModalProps {
  onClose: () => void
  onSubmit: (params: WithdrawalRequestParams) => Promise<void>
  isSubmitting: boolean
}

export const BtcWithdrawModal = ({ onClose, onSubmit, isSubmitting }: BtcWithdrawModalProps) => {
  const { address } = useAccount()
  const { data: userPosition } = useUserPosition(address)
  const { data: vaultMetrics } = useVaultMetrics()

  const [step, setStep] = useState<WithdrawStep>('amount')
  const [amount, setAmount] = useState('')

  const vaultTokensFormatted = userPosition?.vaultTokensFormatted ?? '0'
  const vaultTokensRaw = userPosition?.vaultTokensRaw ?? 0n

  const navRaw = vaultMetrics?.navRaw ?? 0n

  const rbtcEquivalent = useMemo(() => {
    if (!amount || navRaw === 0n) return '0'
    try {
      const sharesWei = parseEther(amount)
      const rbtcWei = (sharesWei * navRaw) / 10n ** 18n
      return formatEther(rbtcWei)
    } catch {
      return '0'
    }
  }, [amount, navRaw])

  const handleNext = () => setStep('review')

  const handleSubmit = useCallback(() => {
    if (!amount) return
    try {
      const sharesWei = parseEther(amount)
      onSubmit({ amount: sharesWei })
    } catch {
      // parseEther may throw on invalid input — noop
    }
  }, [amount, onSubmit])

  const stepIndex = STEP_INDEX[step]

  return (
    <Modal onClose={onClose} data-testid="BtcWithdrawModal">
      <div className="h-full flex flex-col p-4 md:p-6">
        <Header className="mt-16 mb-4">SHARES WITHDRAWAL</Header>

        <div className="mb-12">
          <WithdrawSteps currentStep={stepIndex} />
          <ProgressBar progress={WITHDRAWAL_STEP_PROGRESS[stepIndex]} className="mt-3" />
        </div>

        {step === 'amount' && (
          <WithdrawAmountStep
            amount={amount}
            setAmount={setAmount}
            vaultTokensFormatted={vaultTokensFormatted}
            vaultTokensRaw={vaultTokensRaw}
            rbtcEquivalent={rbtcEquivalent}
            withdrawalFee={BTC_VAULT_WITHDRAWAL_FEE}
            onNext={handleNext}
          />
        )}

        {step === 'review' && (
          <WithdrawReviewStep
            amount={amount}
            rbtcEquivalent={rbtcEquivalent}
            withdrawalFee={BTC_VAULT_WITHDRAWAL_FEE}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </Modal>
  )
}

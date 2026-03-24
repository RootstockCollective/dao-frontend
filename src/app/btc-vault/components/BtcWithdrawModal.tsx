'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Hash } from 'viem'
import { formatEther, parseEther } from 'viem'
import { useAccount } from 'wagmi'

import { Modal } from '@/components/Modal'
import { ProgressBar } from '@/components/ProgressBarNew'
import { Header } from '@/components/Typography'

import { useUserPosition } from '../hooks/useUserPosition'
import { useVaultMetrics } from '../hooks/useVaultMetrics'
import { BTC_VAULT_WITHDRAWAL_FEE, WITHDRAWAL_STEP_PROGRESS } from '../services/constants'
import { WithdrawAllowanceStep } from './WithdrawAllowanceStep'
import { WithdrawAmountStep } from './WithdrawAmountStep'
import { WithdrawReviewStep } from './WithdrawReviewStep'
import { WithdrawSteps } from './WithdrawSteps'

type WithdrawStep = 'amount' | 'allowance' | 'confirm'

const STEP_INDEX: Record<WithdrawStep, number> = { amount: 0, allowance: 1, confirm: 2 }

export interface BtcWithdrawModalProps {
  onClose: () => void
  hasAllowanceFor: (shares: bigint) => Promise<boolean>
  onApproveShares: (shares: bigint) => Promise<void>
  onRequestWithdraw: (shares: bigint) => Promise<void>
  isApprovingShares: boolean
  isWithdrawSubmitting: boolean
  isAllowanceReadLoading: boolean
  isAllowanceTxFailed: boolean
  allowance?: bigint
  allowanceTxHash?: Hash
}

export const BtcWithdrawModal = ({
  onClose,
  hasAllowanceFor,
  onApproveShares,
  onRequestWithdraw,
  isApprovingShares,
  isWithdrawSubmitting,
  allowance,
  isAllowanceReadLoading,
  allowanceTxHash,
  isAllowanceTxFailed,
}: BtcWithdrawModalProps) => {
  const { address } = useAccount()
  const { data: userPosition } = useUserPosition(address)
  const { data: vaultMetrics } = useVaultMetrics()

  const [step, setStep] = useState<WithdrawStep>('amount')
  const [amount, setAmount] = useState('')
  const [sharesWei, setSharesWei] = useState(0n)
  const [visitedAllowanceStep, setVisitedAllowanceStep] = useState(false)
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false)

  const vaultTokensFormatted = userPosition?.vaultTokensFormatted ?? '0'
  const vaultTokensRaw = userPosition?.vaultTokensRaw ?? 0n
  const pricePerShareRaw = vaultMetrics?.pricePerShareRaw ?? 0n

  const rbtcEquivalent = useMemo(() => {
    if (!amount || pricePerShareRaw === 0n) return '0'
    try {
      const shares = parseEther(amount)
      const rbtcWei = (shares * pricePerShareRaw) / 10n ** 18n
      return formatEther(rbtcWei)
    } catch {
      return '0'
    }
  }, [amount, pricePerShareRaw])

  // If allowance becomes sufficient while on the approve step (e.g. refetch), advance to confirm.
  useEffect(() => {
    if (step !== 'allowance') return
    if (sharesWei <= 0n) return
    if (allowance === undefined) return
    if (allowance < sharesWei) return
    setStep('confirm')
  }, [step, sharesWei, allowance])

  const handleAmountContinue = useCallback(async () => {
    if (!amount) return
    try {
      const sw = parseEther(amount)
      setIsCheckingAllowance(true)
      setSharesWei(sw)
      if (await hasAllowanceFor(sw)) {
        setVisitedAllowanceStep(false)
        setStep('confirm')
      } else {
        setVisitedAllowanceStep(true)
        setStep('allowance')
      }
    } catch {
      // parseEther or allowance check failed — stay on amount
    } finally {
      setIsCheckingAllowance(false)
    }
  }, [amount, hasAllowanceFor])

  const handleAllowanceApprove = useCallback(async () => {
    if (sharesWei <= 0n) return
    await onApproveShares(sharesWei)
    if (await hasAllowanceFor(sharesWei)) {
      setStep('confirm')
    }
  }, [sharesWei, onApproveShares, hasAllowanceFor])

  const handleBackFromAllowance = useCallback(() => {
    setStep('amount')
  }, [])

  const handleBackFromConfirm = useCallback(() => {
    setStep('amount')
  }, [])

  const handleConfirmSubmit = useCallback(async () => {
    if (sharesWei <= 0n) return
    await onRequestWithdraw(sharesWei)
  }, [sharesWei, onRequestWithdraw])

  const stepIndex = STEP_INDEX[step]
  const progress =
    WITHDRAWAL_STEP_PROGRESS[stepIndex] ?? WITHDRAWAL_STEP_PROGRESS[WITHDRAWAL_STEP_PROGRESS.length - 1]

  return (
    <Modal onClose={onClose} data-testid="BtcWithdrawModal">
      <div className="h-full flex flex-col p-4 md:p-6">
        <Header className="mt-16 mb-4">WITHDRAW rBTC</Header>

        <div className="mb-12">
          <WithdrawSteps currentStep={stepIndex} />
          <ProgressBar progress={progress} className="mt-3" />
        </div>

        {step === 'amount' && (
          <WithdrawAmountStep
            amount={amount}
            setAmount={setAmount}
            vaultTokensFormatted={vaultTokensFormatted}
            vaultTokensRaw={vaultTokensRaw}
            rbtcEquivalent={rbtcEquivalent}
            withdrawalFee={BTC_VAULT_WITHDRAWAL_FEE}
            isContinuePending={isCheckingAllowance}
            onNext={handleAmountContinue}
          />
        )}

        {step === 'allowance' && (
          <WithdrawAllowanceStep
            sharesWei={sharesWei}
            isAllowanceReadLoading={isAllowanceReadLoading}
            isApproving={isApprovingShares}
            allowanceTxHash={allowanceTxHash}
            isAllowanceTxFailed={isAllowanceTxFailed}
            onRequestAllowance={handleAllowanceApprove}
            onBack={handleBackFromAllowance}
          />
        )}

        {step === 'confirm' && (
          <WithdrawReviewStep
            amount={amount}
            rbtcEquivalent={rbtcEquivalent}
            withdrawalFee={BTC_VAULT_WITHDRAWAL_FEE}
            showWithdrawRequestTxHint={visitedAllowanceStep}
            onBack={handleBackFromConfirm}
            onSubmit={handleConfirmSubmit}
            isSubmitting={isWithdrawSubmitting}
          />
        )}
      </div>
    </Modal>
  )
}

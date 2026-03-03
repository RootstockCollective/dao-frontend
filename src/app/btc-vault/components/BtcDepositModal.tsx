'use client'

import { useCallback, useMemo, useState } from 'react'
import { formatEther, parseEther } from 'viem'
import { useAccount } from 'wagmi'

import { DEFAULT_SLIPPAGE_PERCENTAGE } from '@/app/vault/utils/slippage'
import { Divider } from '@/components/Divider'
import { Modal } from '@/components/Modal'
import { Header } from '@/components/Typography'

import { useUserPosition } from '../hooks/useUserPosition'
import { useVaultMetrics } from '../hooks/useVaultMetrics'
import type { DepositRequestParams } from '../services/types'
import { DepositAmountStep } from './DepositAmountStep'
import { DepositReviewStep } from './DepositReviewStep'

type DepositStep = 'amount' | 'review'

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
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE_PERCENTAGE.toString())

  const rbtcBalanceFormatted = userPosition?.rbtcBalanceFormatted ?? '0'
  const rbtcBalanceRaw = userPosition?.rbtcBalanceRaw ?? 0n

  const navFormatted = vaultMetrics?.navFormatted ?? '0'
  const navTimestamp = vaultMetrics?.timestamp ?? 0
  const navRaw = vaultMetrics?.navRaw ?? 0n

  const estimatedShares = useMemo(() => {
    if (!amount || navRaw === 0n) return '0'
    try {
      const amountWei = parseEther(amount)
      // shares = amount / navPerShare (both in 18 decimals)
      const sharesWei = (amountWei * 10n ** 18n) / navRaw
      return formatEther(sharesWei)
    } catch {
      return '0'
    }
  }, [amount, navRaw])

  const handleNext = () => {
    setStep('review')
  }

  const handleBack = () => {
    setStep('amount')
  }

  const handleSubmit = useCallback(() => {
    if (!amount) return
    try {
      const amountWei = parseEther(amount)
      const slippageDecimal = parseFloat(slippage) / 100
      onSubmit({ amount: amountWei, slippage: slippageDecimal })
    } catch {
      // parseEther may throw on invalid input — noop
    }
  }, [amount, slippage, onSubmit])

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
          <DepositReviewStep
            amount={amount}
            slippage={slippage}
            estimatedShares={estimatedShares}
            navFormatted={navFormatted}
            navTimestamp={navTimestamp}
            depositFee="0"
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </Modal>
  )
}

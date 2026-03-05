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
import type { WithdrawalRequestParams } from '../services/types'
import { WithdrawAmountStep, WithdrawType } from './WithdrawAmountStep'
import { WithdrawReviewStep } from './WithdrawReviewStep'

// No fee at launch per contract spec
const BTC_VAULT_WITHDRAWAL_FEE = '0'

type WithdrawStep = 'amount' | 'review'

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
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE_PERCENTAGE.toString())
  const [withdrawType, setWithdrawType] = useState<WithdrawType>('partial')

  const vaultTokensFormatted = userPosition?.vaultTokensFormatted ?? '0'
  const vaultTokensRaw = userPosition?.vaultTokensRaw ?? 0n

  const navFormatted = vaultMetrics?.navFormatted ?? '0'
  const navTimestamp = vaultMetrics?.timestamp ?? 0
  const navRaw = vaultMetrics?.navRaw ?? 0n

  // rBTC equivalent: shares * navPerShare / 1e18
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

  const handleNext = () => {
    setStep('review')
  }

  const handleBack = () => {
    setStep('amount')
  }

  const handleSubmit = useCallback(() => {
    if (!amount) return
    try {
      const sharesWei = parseEther(amount)
      const slippageDecimal = parseFloat(slippage) / 100
      onSubmit({ amount: sharesWei, slippage: slippageDecimal })
    } catch {
      // parseEther may throw on invalid input — noop
    }
  }, [amount, slippage, onSubmit])

  return (
    <Modal onClose={onClose} data-testid="BtcWithdrawModal">
      <div className="h-full flex flex-col p-4 md:p-6">
        <Header className="mt-16 mb-4">
          {step === 'amount' ? 'WITHDRAW VAULT TOKENS' : 'REVIEW WITHDRAWAL'}
        </Header>
        <Divider className="mb-4" />

        {step === 'amount' && (
          <WithdrawAmountStep
            amount={amount}
            setAmount={setAmount}
            slippage={slippage}
            setSlippage={setSlippage}
            withdrawType={withdrawType}
            setWithdrawType={setWithdrawType}
            vaultTokensFormatted={vaultTokensFormatted}
            vaultTokensRaw={vaultTokensRaw}
            rbtcEquivalent={rbtcEquivalent}
            onNext={handleNext}
          />
        )}

        {step === 'review' && (
          <WithdrawReviewStep
            amount={amount}
            rbtcEquivalent={rbtcEquivalent}
            slippage={slippage}
            navFormatted={navFormatted}
            navTimestamp={navTimestamp}
            withdrawalFee={BTC_VAULT_WITHDRAWAL_FEE}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </Modal>
  )
}

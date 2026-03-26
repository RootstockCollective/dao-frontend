'use client'

import { useMemo } from 'react'

import { Button } from '@/components/Button'
import { Divider } from '@/components/Divider'
import { TransactionInProgressButton } from '@/components/StepActionButtons'
import { TokenImage } from '@/components/TokenImage'
import { Label, Paragraph } from '@/components/Typography'
import Big from '@/lib/big'
import { RBTC } from '@/lib/constants'
import { formatCurrency, formatNumberWithCommas } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'

import { BTC_VAULT_DEPOSIT_DISCLAIMER, DEPOSIT_EXPECTED_COMPLETION } from '../services/constants'

interface DepositReviewStepProps {
  amount: string
  estimatedShares: string
  depositFee: string
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export const DepositReviewStep = ({
  amount,
  estimatedShares,
  depositFee,
  onBack,
  onSubmit,
  isSubmitting,
}: DepositReviewStepProps) => {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const usdEquivalent = useMemo(() => {
    if (!amount || !rbtcPrice) return ''
    try {
      return formatCurrency(Big(rbtcPrice).mul(amount), { showCurrencyLabel: true })
    } catch {
      return ''
    }
  }, [amount, rbtcPrice])

  const sharesFormatted = useMemo(() => {
    if (!estimatedShares) return '0'
    try {
      return formatNumberWithCommas(Big(estimatedShares).round(0))
    } catch {
      return '0'
    }
  }, [estimatedShares])

  return (
    <div className="flex-1 flex flex-col" data-testid="DepositReviewStep">
      <Paragraph variant="body" className="mb-8">
        Make sure that everything is correct before continuing:
      </Paragraph>

      <div className="grid grid-cols-2 gap-y-6 gap-x-10">
        <div className="flex flex-col gap-1" data-testid="review-amount">
          <Label variant="body-s" className="text-text-60">
            Amount to deposit
          </Label>
          <div className="flex items-center gap-2">
            <Label variant="body-l" bold>
              {amount}
            </Label>
            <TokenImage symbol={RBTC} size={20} />
            <Label variant="body-l" bold>
              {RBTC}
            </Label>
          </div>
          {usdEquivalent && (
            <Label variant="body-s" className="text-text-60">
              {usdEquivalent}
            </Label>
          )}
        </div>
        <div className="flex flex-col gap-1" data-testid="review-shares">
          <Label variant="body-s" className="text-text-60">
            No. of shares to receive (est.)
          </Label>
          <Label variant="body-l" bold>
            {sharesFormatted}
          </Label>
        </div>
        <div className="flex flex-col gap-1" data-testid="review-fee">
          <Label variant="body-s" className="text-text-60">
            Deposit fee
          </Label>
          <Label variant="body-l" bold>
            {depositFee}%
          </Label>
        </div>
        <div className="flex flex-col gap-1" data-testid="review-expected-completion">
          <Label variant="body-s" className="text-text-60">
            Expected completion
          </Label>
          <Label variant="body-l" bold>
            {DEPOSIT_EXPECTED_COMPLETION}
          </Label>
        </div>
      </div>

      {/* Footer: 56px gap then divider, disclaimer + Back + Send request */}
      <div className="mt-auto pt-14">
        <Divider />
        <div className="flex justify-between items-center gap-4">
          <Paragraph variant="body-s" className="text-text-60 text-xs max-w-[440px]" data-testid="Disclaimer">
            {BTC_VAULT_DEPOSIT_DISCLAIMER}
          </Paragraph>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary-outline"
              onClick={onBack}
              data-testid="BackButton"
              className="min-w-20 whitespace-nowrap"
            >
              Back
            </Button>
            {isSubmitting ? (
              <TransactionInProgressButton />
            ) : (
              <Button
                variant="primary"
                onClick={onSubmit}
                data-testid="SubmitRequestButton"
                className="whitespace-nowrap"
              >
                Send request
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

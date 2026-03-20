'use client'

import { useMemo } from 'react'

import { Button } from '@/components/Button'
import { Divider } from '@/components/Divider'
import { TokenImage } from '@/components/TokenImage'
import { Label, Paragraph } from '@/components/Typography'
import Big from '@/lib/big'
import { RBTC } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'

import { BTC_VAULT_WITHDRAWAL_DISCLAIMER, WITHDRAWAL_EXPECTED_COMPLETION } from '../services/constants'

interface WithdrawReviewStepProps {
  amount: string
  rbtcEquivalent: string
  withdrawalFee: string
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export const WithdrawReviewStep = ({
  amount,
  rbtcEquivalent,
  withdrawalFee,
  onBack,
  onSubmit,
  isSubmitting,
}: WithdrawReviewStepProps) => {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const usdEquivalent = useMemo(() => {
    if (!rbtcEquivalent || rbtcEquivalent === '0' || !rbtcPrice) return ''
    try {
      return formatCurrency(Big(rbtcPrice).mul(rbtcEquivalent), { showCurrencyLabel: true })
    } catch {
      return ''
    }
  }, [rbtcEquivalent, rbtcPrice])

  return (
    <div className="flex-1 flex flex-col" data-testid="WithdrawReviewStep">
      <Paragraph variant="body" className="mb-8">
        Make sure that everything is correct before continuing:
      </Paragraph>

      <div className="grid grid-cols-2 gap-6 gap-x-10">
        {/* Left column: No. of shares + Redemption fee */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1" data-testid="review-shares">
            <Label variant="body-s" className="text-text-60">
              No. of shares to withdraw
            </Label>
            <Label variant="body-l" bold>
              {amount}
            </Label>
          </div>
          <div className="flex flex-col gap-1" data-testid="review-fee">
            <Label variant="body-s" className="text-text-60">
              Redemption fee
            </Label>
            <Label variant="body-l" bold>
              {withdrawalFee}%
            </Label>
          </div>
        </div>

        {/* Right column: Redemption value (est.) + Expected completion */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1" data-testid="review-redemption-value">
            <Label variant="body-s" className="text-text-60">
              Redemption value (est.)
            </Label>
            <div className="flex items-center gap-2">
              <TokenImage symbol={RBTC} size={20} />
              <Label variant="body-l" bold>
                {rbtcEquivalent} {RBTC}
              </Label>
            </div>
            {usdEquivalent && (
              <Label variant="body-s" className="text-text-60">
                {usdEquivalent}
              </Label>
            )}
          </div>
          <div className="flex flex-col gap-1" data-testid="review-expected-completion">
            <Label variant="body-s" className="text-text-60">
              Expected completion
            </Label>
            <Label variant="body-l" bold>
              {WITHDRAWAL_EXPECTED_COMPLETION}
            </Label>
          </div>
        </div>
      </div>

      {/* Footer: 56px gap then divider, disclaimer + Back + Send request */}
      <div className="mt-auto pt-14">
        <Divider />
        <div className="flex justify-between items-center gap-4">
          <Paragraph variant="body-s" className="text-text-60 text-xs max-w-[440px]" data-testid="Disclaimer">
            {BTC_VAULT_WITHDRAWAL_DISCLAIMER}
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
            <Button
              variant="primary"
              onClick={onSubmit}
              disabled={isSubmitting}
              data-testid="SubmitRequestButton"
              className="whitespace-nowrap"
            >
              {isSubmitting ? 'Submitting...' : 'Send request'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

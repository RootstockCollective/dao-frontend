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

import { BTC_VAULT_DEPOSIT_DISCLAIMER } from '../services/constants'
import { ReviewRow } from './ReviewRow'

interface DepositReviewStepProps {
  amount: string
  estimatedShares: string
  navFormatted: string
  depositFee: string
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export const DepositReviewStep = ({
  amount,
  estimatedShares,
  navFormatted,
  depositFee,
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

  return (
    <div className="flex-1 flex flex-col" data-testid="DepositReviewStep">
      <Paragraph variant="body" className="mb-8">
        Make sure that everything is correct before continuing:
      </Paragraph>

      <div className="flex flex-col gap-6">
        {/* --- Amount to deposit (horizontal, with USD) --- */}
        <div className="flex flex-col gap-1" data-testid="review-amount">
          <Label variant="body-s" className="text-text-60">
            Amount to deposit
          </Label>
          <div className="flex items-center gap-2">
            <TokenImage symbol="RBTC" size={20} />
            <Label variant="body-l" bold>
              {amount} {RBTC}
            </Label>
          </div>
          {usdEquivalent && (
            <Label variant="body-s" className="text-text-60">
              {usdEquivalent}
            </Label>
          )}
        </div>

        {/* --- Shares + Fee side by side --- */}
        <div className="flex gap-10">
          <div className="flex-1 flex flex-col gap-1" data-testid="review-shares">
            <Label variant="body-s" className="text-text-60">
              No. of shares to receive (est.)
            </Label>
            <Label variant="body-l" bold>
              {estimatedShares}
            </Label>
          </div>
          <div className="flex-1 flex flex-col gap-1" data-testid="review-fee">
            <Label variant="body-s" className="text-text-60">
              Deposit fee
            </Label>
            <Label variant="body-l" bold>
              {depositFee}%
            </Label>
          </div>
        </div>

        {/* --- NAV --- */}
        <ReviewRow label="Last confirmed NAV" value={`${navFormatted} ${RBTC}/share`} testId="review-nav" />
      </div>

      {/* --- Footer: Disclaimer + Send request --- */}
      <div className="mt-auto pt-4">
        <Divider />
        <div className="flex justify-between items-center gap-4 pt-4">
          <Paragraph variant="body-s" className="text-text-60 text-xs max-w-[440px]" data-testid="Disclaimer">
            {BTC_VAULT_DEPOSIT_DISCLAIMER}
          </Paragraph>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={isSubmitting}
            data-testid="SubmitRequestButton"
          >
            {isSubmitting ? 'Submitting...' : 'Send request'}
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Button } from '@/components/Button'
import { Divider } from '@/components/Divider'
import { Paragraph, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import { formatTimestamp } from '../services/ui/formatters'
import { ReviewRow } from './ReviewRow'

const DISCLOSURES = [
  'This is a request and does not transfer assets immediately',
  'Redemption value is calculated at the NAV confirmed at epoch close',
  'Withdrawal is a two-step process: request now, claim after epoch settles',
  'Once the epoch is closed, withdrawal requests cannot be canceled',
] as const

interface WithdrawReviewStepProps {
  amount: string
  rbtcEquivalent: string
  slippage: string
  navFormatted: string
  navTimestamp: number
  withdrawalFee: string
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export const WithdrawReviewStep = ({
  amount,
  rbtcEquivalent,
  slippage,
  navFormatted,
  navTimestamp,
  withdrawalFee,
  onBack,
  onSubmit,
  isSubmitting,
}: WithdrawReviewStepProps) => {
  return (
    <div className="flex-1 flex flex-col" data-testid="WithdrawReviewStep">
      <div className="flex flex-col gap-3 py-3 px-4 rounded-1 w-full bg-bg-60">
        <ReviewRow label="Withdrawal amount" value={`${amount} Vault Tokens`} testId="review-amount" />
        <ReviewRow label="Estimated rBTC" value={`≈ ${rbtcEquivalent} ${RBTC}`} testId="review-rbtc" />
        <ReviewRow
          label="Last confirmed NAV"
          value={`${navFormatted} ${RBTC}/share`}
          subValue={`Updated ${formatTimestamp(navTimestamp)}`}
          testId="review-nav"
        />
        <ReviewRow label="Redemption fee" value={`${withdrawalFee}%`} testId="review-fee" />
        <ReviewRow label="Slippage tolerance" value={`${slippage}%`} testId="review-slippage" />
      </div>

      <Divider className="my-4" />

      <div className="flex flex-col gap-2 px-4" data-testid="review-disclosures">
        {DISCLOSURES.map((disclosure, i) => (
          <div key={i} className="flex items-start gap-2 p-3 rounded-1 bg-bg-60">
            <Span className="text-primary shrink-0">i</Span>
            <Paragraph variant="body-s" className="text-text-60">
              {disclosure}
            </Paragraph>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4">
        <div className="flex justify-between gap-4">
          <Button variant="secondary" onClick={onBack} data-testid="BackButton" disabled={isSubmitting}>
            Back
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={isSubmitting}
            data-testid="SubmitRequestButton"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </div>
    </div>
  )
}

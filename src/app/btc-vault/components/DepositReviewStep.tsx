'use client'

import { Button } from '@/components/Button'
import { Divider } from '@/components/Divider'
import { Label, Paragraph, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import { formatTimestamp } from '../services/ui/formatters'

const DISCLOSURES = [
  'This is a request and requires approval',
  'Shares are minted at the NAV confirmed at epoch close',
  'Once the epoch is closed, deposit requests cannot be canceled',
] as const

interface DepositReviewStepProps {
  amount: string
  slippage: string
  estimatedShares: string
  navFormatted: string
  navTimestamp: number
  depositFee: string
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export const DepositReviewStep = ({
  amount,
  slippage,
  estimatedShares,
  navFormatted,
  navTimestamp,
  depositFee,
  onBack,
  onSubmit,
  isSubmitting,
}: DepositReviewStepProps) => {
  return (
    <div className="flex-1 flex flex-col" data-testid="DepositReviewStep">
      <div className="flex flex-col gap-3 py-3 px-4 rounded-1 w-full bg-bg-60">
        <ReviewRow label="Deposit amount" value={`${amount} ${RBTC}`} testId="review-amount" />
        <ReviewRow label="Estimated vault shares" value={estimatedShares} testId="review-shares" />
        <ReviewRow
          label="Last confirmed NAV"
          value={`${navFormatted} ${RBTC}/share`}
          subValue={`Updated ${formatTimestamp(navTimestamp)}`}
          testId="review-nav"
        />
        <ReviewRow label="Deposit fee" value={`${depositFee}%`} testId="review-fee" />
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

interface ReviewRowProps {
  label: string
  value: string
  testId: string
  subValue?: string
}

const ReviewRow = ({ label, value, subValue, testId }: ReviewRowProps) => (
  <div className="flex justify-between items-start" data-testid={testId}>
    <Label variant="body-s" className="text-text-60">
      {label}
    </Label>
    <div className="flex flex-col items-end">
      <Label variant="body-s" bold>
        {value}
      </Label>
      {subValue && (
        <Label variant="body-s" className="text-text-40">
          {subValue}
        </Label>
      )}
    </div>
  </div>
)

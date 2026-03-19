'use client'

import { Button } from '@/components/Button'
import { ExternalLinkIcon } from '@/components/Icons'
import { Header, Label } from '@/components/Typography'
import { cn } from '@/lib/utils'

const SECTION_HEADER = 'ELIGIBILITY'
const NONE_INSTRUCTION =
  'Deposits are locked until KYB is approved. Submit KYB to unlock deposits once the review is complete.'
const REJECTED_PREFIX = "We couldn't approve your KYB submission because of"
const REJECTED_SUFFIX = ' Update the information and resubmit to unlock deposits.'
const SUBMIT_KYB_LABEL = 'Submit KYB'
const RESUBMIT_KYB_LABEL = 'Re-submit KYB'
const CHECK_STATUS_LABEL = 'KYB already submitted? Check KYB status'

export type EligibilityBannerVariant = 'none' | 'rejected'

export interface EligibilityBannerContentProps {
  variant: EligibilityBannerVariant
  onSubmitKyb: () => void
  onCheckStatus: () => void
  rejectionReason?: string
}

function ShieldExclamationIcon({ className }: { className?: string }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn('shrink-0', className)}
      data-testid="EligibilityBannerRejectedIcon"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3zm0 10a1 1 0 01-1-1V8a1 1 0 112 0v3a1 1 0 01-1 1zm0 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Presentational eligibility banner for No KYB and KYB Rejected states.
 * Renders section header, copy, primary CTA, and secondary "Check KYB status" link.
 * Caller wraps in card; no data fetching.
 */
export function EligibilityBannerContent({
  variant,
  rejectionReason,
  onSubmitKyb,
  onCheckStatus,
}: EligibilityBannerContentProps) {
  const rejectionMessage = rejectionReason
    ? `${REJECTED_PREFIX} ${rejectionReason}.${REJECTED_SUFFIX}`
    : `${REJECTED_PREFIX}...${REJECTED_SUFFIX}`

  return (
    <section data-testid="EligibilityBannerContent" className="flex flex-col gap-3">
      <Header variant="h3" className="text-v3-text-0 uppercase leading-[130%] tracking-[0.4px]">
        {SECTION_HEADER}
      </Header>

      {variant === 'none' && (
        <>
          <Label variant="body-l" className="text-v3-text-0 leading-[133%]">
            {NONE_INSTRUCTION}
          </Label>
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={onSubmitKyb} data-testid="EligibilityBannerSubmitKyb">
              {SUBMIT_KYB_LABEL}
            </Button>
            <button
              type="button"
              onClick={onCheckStatus}
              className={cn(
                'inline-flex w-fit items-center gap-1.5 font-sora text-sm leading-normal',
                'underline underline-offset-2 underline-thick text-primary hover:cursor-pointer',
              )}
              data-testid="EligibilityBannerCheckStatus"
            >
              {CHECK_STATUS_LABEL}
              <ExternalLinkIcon size={14} aria-label="" />
            </button>
          </div>
        </>
      )}

      {variant === 'rejected' && (
        <>
          <div className="flex items-start gap-2">
            <ShieldExclamationIcon className="text-v3-text-0 mt-0.5" />
            <Label variant="body-l" className="text-v3-text-0 leading-[133%]">
              {rejectionMessage}
            </Label>
          </div>
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={onSubmitKyb} data-testid="EligibilityBannerSubmitKyb">
              {RESUBMIT_KYB_LABEL}
            </Button>
            <button
              type="button"
              onClick={onCheckStatus}
              className={cn(
                'inline-flex w-fit items-center gap-1.5 font-sora text-sm leading-normal',
                'underline underline-offset-2 underline-thick text-primary hover:cursor-pointer',
              )}
              data-testid="EligibilityBannerCheckStatus"
            >
              {CHECK_STATUS_LABEL}
              <ExternalLinkIcon size={14} aria-label="" />
            </button>
          </div>
        </>
      )}
    </section>
  )
}

'use client'

import { Button } from '@/components/Button'
import { ExternalLinkIcon, ShieldExclamationIcon } from '@/components/Icons'
import { ExternalLink } from '@/components/Link'
import { Header, Label, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

const SECTION_HEADER = 'ELIGIBILITY'
const NONE_INSTRUCTION =
  'Deposits are locked until KYB is approved. Submit KYB to unlock deposits once the review is complete.'
const REJECTED_PREFIX = "We couldn't approve your KYB submission because of"
const REJECTED_SUFFIX = ' Update the information and resubmit to unlock deposits.'
const SUBMIT_KYB_LABEL = 'Submit KYB'
const RESUBMIT_KYB_LABEL = 'Re-submit KYB'
const CHECK_STATUS_LABEL = 'KYB already submitted? Check KYB status'
const CHECK_STATUS_LINK_HREF_PLACEHOLDER = '#'

export type EligibilityBannerVariant = 'none' | 'rejected'

export interface EligibilityBannerContentProps {
  variant: EligibilityBannerVariant
  onSubmitKyb: () => void
  onCheckStatus: () => void
  /** When provided, used as href for "Check KYB status" link (e.g. external status page). Otherwise uses "#" and relies on onCheckStatus. */
  checkStatusHref?: string
  /** When supplied from a real API, caller must sanitize (e.g. DOMPurify) or escape to prevent XSS. */
  rejectionReason?: string
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
  checkStatusHref = CHECK_STATUS_LINK_HREF_PLACEHOLDER,
}: EligibilityBannerContentProps) {
  const rejectionMessage = rejectionReason
    ? `${REJECTED_PREFIX} ${rejectionReason}.${REJECTED_SUFFIX}`
    : `${REJECTED_PREFIX}...${REJECTED_SUFFIX}`

  return (
    <section data-testid="eligibility-banner-content" className="flex flex-col gap-3">
      <Header variant="h3" className="text-v3-text-0 uppercase leading-[130%] tracking-[0.4px]">
        {SECTION_HEADER}
      </Header>

      {variant === 'none' && (
        <>
          <Label variant="body-l" className="text-v3-text-0 leading-[133%]">
            {NONE_INSTRUCTION}
          </Label>
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={onSubmitKyb} data-testid="eligibility-banner-submit-kyb">
              {SUBMIT_KYB_LABEL}
            </Button>
            <ExternalLink
              href={checkStatusHref}
              onClick={onCheckStatus}
              {...(checkStatusHref !== CHECK_STATUS_LINK_HREF_PLACEHOLDER && {
                target: '_blank',
                rel: 'noopener noreferrer',
              })}
              className="text-primary"
              data-testid="eligibility-banner-check-status"
            >
              <Span className="inline-flex items-center gap-1.5">
                {CHECK_STATUS_LABEL}
                <ExternalLinkIcon size={14} aria-label="" />
              </Span>
            </ExternalLink>
          </div>
        </>
      )}

      {variant === 'rejected' && (
        <>
          <div className="flex items-start gap-2">
            <ShieldExclamationIcon
              className={cn('shrink-0 text-v3-text-0 mt-0.5')}
              data-testid="eligibility-banner-rejected-icon"
            />
            <Label variant="body-l" className="text-v3-text-0 leading-[133%]">
              {rejectionMessage}
            </Label>
          </div>
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={onSubmitKyb} data-testid="eligibility-banner-submit-kyb">
              {RESUBMIT_KYB_LABEL}
            </Button>
            <ExternalLink
              href={checkStatusHref}
              onClick={onCheckStatus}
              {...(checkStatusHref !== CHECK_STATUS_LINK_HREF_PLACEHOLDER && {
                target: '_blank',
                rel: 'noopener noreferrer',
              })}
              className="text-primary"
              data-testid="eligibility-banner-check-status"
            >
              <Span className="inline-flex items-center gap-1.5">
                {CHECK_STATUS_LABEL}
                <ExternalLinkIcon size={14} aria-label="" />
              </Span>
            </ExternalLink>
          </div>
        </>
      )}
    </section>
  )
}

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

  const linkClassName = 'text-[#171412] hover:opacity-80'
  const contentMaxWidth = 'max-w-xl'

  return (
    <section data-testid="eligibility-banner-content" className="flex flex-col gap-4">
      <Header variant="h4" className="text-v3-text-0 font-bold uppercase leading-[130%] tracking-[0.4px]">
        {SECTION_HEADER}
      </Header>

      {variant === 'none' && (
        <>
          <Label variant="body-l" className={cn('text-[#171412] leading-[133%]', contentMaxWidth)}>
            {NONE_INSTRUCTION}
          </Label>
          <div className="flex flex-col gap-4">
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
              className={linkClassName}
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
          <div className={cn('flex items-start gap-3', contentMaxWidth)}>
            <ShieldExclamationIcon
              className="shrink-0 mt-0.5"
              size={24}
              data-testid="eligibility-banner-rejected-icon"
            />
            <Label variant="body-l" className="text-[#171412] leading-[133%] min-w-0">
              {rejectionMessage}
            </Label>
          </div>
          {/* Button aligned with message text (icon 24px + gap-3 12px = 36px) */}
          <div className="ml-9">
            <Button variant="primary" onClick={onSubmitKyb} data-testid="eligibility-banner-submit-kyb">
              {RESUBMIT_KYB_LABEL}
            </Button>
          </div>
          {/* Link aligned with shield icon (same left as icon) */}
          <ExternalLink
            href={checkStatusHref}
            onClick={onCheckStatus}
            {...(checkStatusHref !== CHECK_STATUS_LINK_HREF_PLACEHOLDER && {
              target: '_blank',
              rel: 'noopener noreferrer',
            })}
            className={linkClassName}
            data-testid="eligibility-banner-check-status"
          >
            <Span className="inline-flex items-center gap-1.5">
              {CHECK_STATUS_LABEL}
              <ExternalLinkIcon size={14} aria-label="" />
            </Span>
          </ExternalLink>
        </>
      )}
    </section>
  )
}

'use client'

import { ShieldExclamationIcon } from '@/components/Icons'
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
const CHECK_STATUS_TEXT = 'KYB already submitted? Check KYB status in the designated KYB portal'
const KYB_PORTAL_URL = 'https://www.rootstocklabs.com/institutional/'

export type EligibilityBannerVariant = 'none' | 'rejected'

export interface EligibilityBannerContentProps {
  variant: EligibilityBannerVariant
  /** When supplied from a real API, caller must sanitize (e.g. DOMPurify) or escape to prevent XSS. */
  rejectionReason?: string
}

/**
 * Presentational eligibility banner for No KYB and KYB Rejected states.
 * Renders section header, copy, primary CTA linking to KYB portal, and secondary status text.
 * Caller wraps in card; no data fetching.
 */
export function EligibilityBannerContent({ variant, rejectionReason }: EligibilityBannerContentProps) {
  const rejectionMessage = rejectionReason
    ? `${REJECTED_PREFIX} ${rejectionReason}.${REJECTED_SUFFIX}`
    : `${REJECTED_PREFIX}...${REJECTED_SUFFIX}`

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
            <ExternalLink
              href={KYB_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden py-3 px-4 rounded-sm font-bold text-base transition-all duration-150 flex items-center justify-center w-full md:w-fit bg-primary text-bg-100 border border-primary"
              data-testid="eligibility-banner-submit-kyb"
            >
              <Span bold>{SUBMIT_KYB_LABEL}</Span>
            </ExternalLink>
            <Span className="text-[#171412]" data-testid="eligibility-banner-check-status">
              {CHECK_STATUS_TEXT}
            </Span>
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
          {/* Link aligned with message text (icon 24px + gap-3 12px = 36px) */}
          <div className="ml-9">
            <ExternalLink
              href={KYB_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden py-3 px-4 rounded-sm font-bold text-base transition-all duration-150 flex items-center justify-center w-full md:w-fit bg-primary text-bg-100 border border-primary"
              data-testid="eligibility-banner-submit-kyb"
            >
              <Span bold>{RESUBMIT_KYB_LABEL}</Span>
            </ExternalLink>
          </div>
          <Span className="text-[#171412]" data-testid="eligibility-banner-check-status">
            {CHECK_STATUS_TEXT}
          </Span>
        </>
      )}
    </section>
  )
}

'use client'

import { Clock } from 'lucide-react'
import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'

import { TokenImage } from '@/components/TokenImage'
import { Label, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { btcVaultRequestHistory } from '@/shared/constants/routes'

import { RequestStatusStepper } from '../request-history/[id]/components/RequestStatusStepper'
import type { ActiveRequestDisplay } from '../services/ui/types'

function getRequestTypeLabel(type: ActiveRequestDisplay['type']): string {
  return type === 'deposit' ? 'Deposit' : 'Withdrawal'
}

function getAmountLabel(type: ActiveRequestDisplay['type']): string {
  return type === 'deposit' ? 'Amount to deposit' : 'Amount to withdraw'
}

export interface RequestProcessingBlockProps extends ComponentPropsWithoutRef<'section'> {
  request: ActiveRequestDisplay
}

/**
 * Renders the request processing UI: progress tracker, request details, and history link.
 *
 * **Usage:** This component must be wrapped in a `SectionContainer` from
 * `@/app/communities/components/SectionContainer` to match the btc-vault page layout.
 *
 * @example
 * ```tsx
 * <SectionContainer title="ACTIVE REQUEST" headerVariant="h3">
 *   <RequestProcessingBlock request={activeRequest} />
 * </SectionContainer>
 * ```
 */
export function RequestProcessingBlock({ request, className, ...props }: RequestProcessingBlockProps) {
  return (
    <section
      data-testid="request-processing-block"
      className={cn('flex flex-col gap-6 w-full', className)}
      {...props}
    >
      <RequestStatusStepper status={request.status} type={request.type} />

      <div className="flex w-full min-w-0 flex-col gap-4 md:flex-row md:gap-6">
        <div className="flex min-w-0 flex-col gap-2 md:flex-1 md:min-w-0">
          <Label variant="tag" className="text-bg-0">
            Request type
          </Label>
          <Span variant="body-l" className="text-100 overflow-hidden text-ellipsis">
            {getRequestTypeLabel(request.type)}
          </Span>
        </div>
        <div className="flex min-w-0 flex-col gap-2 md:flex-1 md:min-w-0">
          <Label variant="tag" className="text-bg-0">
            {getAmountLabel(request.type)}
          </Label>
          <div className="flex min-w-0 flex-col">
            <div className="flex min-w-0 items-center gap-1">
              <Span variant="body-l" className="min-w-0 flex-1 overflow-hidden text-ellipsis text-100">
                {request.amountFormatted}
              </Span>
              <TokenImage symbol={RBTC} size={16} />
              <Span variant="body-l" className="shrink-0 text-100">
                {RBTC}
              </Span>
            </div>
            {request.usdEquivalentFormatted && (
              <Span variant="body-xs" bold className="text-bg-0">
                {request.usdEquivalentFormatted}
              </Span>
            )}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-2 md:flex-1 md:min-w-0">
          <Label variant="tag" className="text-bg-0">
            Shares
          </Label>
          <Span variant="body-l" className="text-100 overflow-hidden text-ellipsis">
            {request.sharesFormatted}
          </Span>
        </div>
        <div className="flex min-w-0 flex-col gap-2 md:flex-1 md:min-w-0">
          <Label variant="tag" className="text-bg-0">
            Last updated on
          </Label>
          <Span variant="body-l" className="text-100 overflow-hidden text-ellipsis">
            {request.lastUpdatedFormatted}
          </Span>
        </div>
      </div>

      <Link
        href={btcVaultRequestHistory}
        className="inline-flex items-center gap-2 text-100 hover:underline mt-6"
        data-testid="view-requests-history-link"
      >
        <Clock className="h-4 w-4 shrink-0" aria-hidden />
        <Span variant="body-s" bold>
          View requests history
        </Span>
      </Link>
    </section>
  )
}

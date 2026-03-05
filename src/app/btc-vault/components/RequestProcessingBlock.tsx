'use client'

import { Clock } from 'lucide-react'
import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'

import { ProgressBar } from '@/components/ProgressBarNew'
import { TokenImage } from '@/components/TokenImage'
import { Label, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { btcVaultRequestDetail } from '@/shared/constants/routes'

import type { ActiveRequestDisplay } from '../services/ui/types'

const STAGES = ['Submitted', 'Pending', 'Approved', 'Successful'] as const

function getCurrentStage(status: ActiveRequestDisplay['status']): number {
  switch (status) {
    case 'pending':
      return 2
    case 'claimable':
      return 3
    case 'done':
      return 4
    default:
      return 2
  }
}

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
  const currentStage = getCurrentStage(request.status)
  const progressPercent = currentStage * 25

  return (
    <section
      data-testid="request-processing-block"
      className={cn('flex flex-col gap-6 w-full', className)}
      {...props}
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2">
          {STAGES.map((label, i) => {
            const stageNum = i + 1
            const isActive = stageNum <= currentStage
            const isCurrent = stageNum === currentStage
            return (
              <Span
                key={label}
                variant="tag"
                caps
                data-stage={stageNum}
                className={cn(
                  'transition-colors',
                  isCurrent && 'font-semibold text-primary',
                  isActive && !isCurrent && 'text-100',
                  !isActive && 'text-200',
                )}
              >
                {label}
              </Span>
            )
          })}
        </div>
        <ProgressBar progress={progressPercent} className="w-full" />
      </div>

      <div className="flex gap-6 self-stretch">
        <div className="flex flex-1 min-w-0 flex-col gap-2">
          <Label variant="tag" className="text-bg-0">
            Request type
          </Label>
          <Span variant="body-l" className="text-100 overflow-hidden text-ellipsis">
            {getRequestTypeLabel(request.type)}
          </Span>
        </div>
        <div className="flex flex-1 min-w-0 flex-col gap-2">
          <Label variant="tag" className="text-bg-0">
            {getAmountLabel(request.type)}
          </Label>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <Span variant="body-l" className="text-100 overflow-hidden text-ellipsis">
                {request.amountFormatted}
              </Span>
              <TokenImage symbol={RBTC} size={16} />
              <Span variant="body-l" className="text-100">
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
        <div className="flex flex-1 min-w-0 flex-col gap-2">
          <Label variant="tag" className="text-bg-0">
            Shares
          </Label>
          <Span variant="body-l" className="text-100 overflow-hidden text-ellipsis">
            {request.sharesFormatted}
          </Span>
        </div>
        <div className="flex flex-1 min-w-0 flex-col gap-2">
          <Label variant="tag" className="text-bg-0">
            Last updated on
          </Label>
          <Span variant="body-l" className="text-100 overflow-hidden text-ellipsis">
            {request.lastUpdatedFormatted}
          </Span>
        </div>
      </div>

      <Link
        href={btcVaultRequestDetail(request.id)}
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

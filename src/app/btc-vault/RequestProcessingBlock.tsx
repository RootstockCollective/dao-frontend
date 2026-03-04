'use client'

import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'
import { Clock } from 'lucide-react'
import type { ActiveRequestDisplay } from './services/ui/types'
import { ProgressBar } from '@/components/ProgressBarNew'
import { btcVaultRequestHistory } from '@/shared/constants/routes'
import { cn } from '@/lib/utils'

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

function getStatusMessage(status: ActiveRequestDisplay['status']): string {
  switch (status) {
    case 'pending':
      return 'Waiting for epoch to close'
    case 'claimable':
      return 'Ready for next step'
    case 'done':
      return 'Request completed'
    default:
      return 'Waiting for epoch to close'
  }
}

function getRequestTypeLabel(type: ActiveRequestDisplay['type']): string {
  return type === 'deposit' ? 'Deposit' : 'Withdrawal'
}

export interface RequestProcessingBlockProps extends ComponentPropsWithoutRef<'section'> {
  request: ActiveRequestDisplay
}

export function RequestProcessingBlock({ request, className, ...props }: RequestProcessingBlockProps) {
  const currentStage = getCurrentStage(request.status)
  const progressPercent = currentStage * 25

  return (
    <section
      data-testid="request-processing-block"
      className={cn('flex flex-col gap-4 w-full', className)}
      {...props}
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-100">Request processing</h2>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2 text-sm">
          {STAGES.map((label, i) => {
            const stageNum = i + 1
            const isActive = stageNum <= currentStage
            const isCurrent = stageNum === currentStage
            return (
              <span
                key={label}
                data-stage={stageNum}
                className={cn(
                  'transition-colors',
                  isCurrent && 'font-semibold text-primary',
                  isActive && !isCurrent && 'text-100',
                  !isActive && 'text-200',
                )}
              >
                {label}
              </span>
            )
          })}
        </div>
        <ProgressBar progress={progressPercent} className="w-full" />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-200">Request type</dt>
        <dd className="text-100">{getRequestTypeLabel(request.type)}</dd>

        <dt className="text-200">Amount</dt>
        <dd>
          <span className="text-100">{request.amountFormatted} rBTC</span>
          {request.usdEquivalentFormatted && (
            <span className="block text-200 text-xs">{request.usdEquivalentFormatted}</span>
          )}
        </dd>

        <dt className="text-200">Shares</dt>
        <dd className="text-100">{request.sharesFormatted}</dd>

        <dt className="text-200">Last updated on</dt>
        <dd className="text-100">{request.lastUpdatedFormatted}</dd>
      </dl>

      <p className="text-sm text-100" data-testid="request-status-message">
        {getStatusMessage(request.status)}
      </p>

      <Link
        href={btcVaultRequestHistory}
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        data-testid="view-requests-history-link"
      >
        <Clock className="h-4 w-4 shrink-0" aria-hidden />
        View requests history
      </Link>
    </section>
  )
}

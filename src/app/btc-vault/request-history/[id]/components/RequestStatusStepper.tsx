'use client'

import { ProgressBar } from '@/components/ProgressBarNew'
import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

import type { RequestStatus, RequestType } from '../../../services/types'

const WITHDRAWAL_STAGES = ['Submitted', 'Pending', 'Approved', 'Redeemed'] as const
const DEPOSIT_STAGES = ['Submitted', 'Pending', 'Approved', 'Deposited'] as const

function getStages(type: RequestType) {
  return type === 'withdrawal' ? WITHDRAWAL_STAGES : DEPOSIT_STAGES
}

function getCurrentStage(status: RequestStatus): number {
  switch (status) {
    case 'pending':
      return 2
    case 'claimable':
      return 3
    case 'done':
      return 4
    case 'failed':
      return 0
    default:
      return 1
  }
}

interface RequestStatusStepperProps {
  status: RequestStatus
  type: RequestType
}

export function RequestStatusStepper({ status, type }: RequestStatusStepperProps) {
  const stages = getStages(type)
  const isFailed = status === 'failed'
  const currentStage = isFailed ? 1 : getCurrentStage(status)
  const progressPercent = isFailed ? 0 : currentStage * 25

  return (
    <div data-testid="request-status-stepper" className="flex flex-col gap-2">
      <div className="flex justify-between gap-2">
        {stages.map((label, i) => {
          const stageNum = i + 1
          const isActive = !isFailed && stageNum <= currentStage
          const isCurrent = !isFailed && stageNum === currentStage
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
      {isFailed && (
        <Span variant="tag" caps data-testid="failed-indicator" className="font-semibold text-destructive">
          Failed
        </Span>
      )}
    </div>
  )
}

'use client'

import { ProgressStepper } from '@/components/ProgressBarNew'

import type { RequestStatus, RequestType } from '../../../services/types'

const WITHDRAWAL_STAGES = ['Submitted', 'Pending', 'Approved', 'Redeemed'] as const
const DEPOSIT_STAGES = ['Submitted', 'Pending', 'Approved', 'Shares claimed'] as const
const CANCELLED_STAGES = ['Submitted', 'Pending', 'Cancelled by user'] as const

function getStages(type: RequestType, status: RequestStatus) {
  if (status === 'cancelled') return CANCELLED_STAGES
  return type === 'withdrawal' ? WITHDRAWAL_STAGES : DEPOSIT_STAGES
}

// TODO: failed requests show a notification instead of a stepper stage
function getCurrentStage(status: RequestStatus): number | null {
  switch (status) {
    case 'pending':
      return 2
    case 'claimable':
      return 3
    case 'done':
      return 4
    case 'failed':
      return null
    case 'cancelled':
      return 3
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}

interface RequestStatusStepperProps {
  status: RequestStatus
  type: RequestType
}

export function RequestStatusStepper({ status, type }: RequestStatusStepperProps) {
  const currentStage = getCurrentStage(status)
  if (currentStage === null) return null

  const stages = getStages(type, status)

  return (
    <div data-testid="request-status-stepper">
      <ProgressStepper stages={stages} currentStage={currentStage} showSeparators />
    </div>
  )
}

'use client'

import { ProgressStepper } from '@/components/ProgressBarNew'

import type { RequestStatus, RequestType } from '../../../services/types'
import type { DisplayStatus } from '../../../services/ui/types'

const WITHDRAWAL_STAGES = ['Submitted', 'Pending', 'Approved', 'Redeemed'] as const
const DEPOSIT_STAGES = ['Submitted', 'Pending', 'Approved', 'Shares claimed'] as const
const CANCELLED_STAGES = ['Submitted', 'Pending', 'Cancelled by user'] as const

function getStages(type: RequestType, status: RequestStatus) {
  if (status === 'cancelled') return CANCELLED_STAGES
  return type === 'withdrawal' ? WITHDRAWAL_STAGES : DEPOSIT_STAGES
}

function getCurrentStage(status: RequestStatus, displayStatus?: DisplayStatus): number | null {
  if (status === 'pending' && displayStatus === 'approved') return 3
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
  displayStatus?: DisplayStatus
}

export function RequestStatusStepper({ status, type, displayStatus }: RequestStatusStepperProps) {
  const currentStage = getCurrentStage(status, displayStatus)
  if (currentStage === null) return null

  const stages = getStages(type, status)

  return (
    <div data-testid="request-status-stepper">
      <ProgressStepper stages={stages} currentStage={currentStage} />
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'
import { Span } from '@/components/Typography'
import type { ActionEligibility } from '../services/ui/types'
import { DEPOSIT_PAUSE_REASON, WITHDRAWAL_PAUSE_REASON, ACTIVE_REQUEST_REASON } from '../BtcVaultBanners'

interface EligibilityIndicatorProps {
  eligibility: ActionEligibility
}

function isPauseReason(reason: string): boolean {
  return reason === DEPOSIT_PAUSE_REASON || reason === WITHDRAWAL_PAUSE_REASON
}

function isEligibilityReason(reason: string): boolean {
  return reason.length > 0 && !isPauseReason(reason) && reason !== ACTIVE_REQUEST_REASON
}

function getStatusParts(eligibility: ActionEligibility): { kybLabel: string; pauseLabel: string | null } {
  const isNotAuthorized = isEligibilityReason(eligibility.depositBlockReason)
  const kybLabel = isNotAuthorized ? 'KYB: Not Authorized' : 'KYB: Approved'

  const depositsPaused = eligibility.depositBlockReason === DEPOSIT_PAUSE_REASON
  const withdrawalsPaused = eligibility.withdrawBlockReason === WITHDRAWAL_PAUSE_REASON

  let pauseLabel: string | null = null
  if (depositsPaused && withdrawalsPaused) {
    pauseLabel = 'Vault: Paused'
  } else if (depositsPaused) {
    pauseLabel = 'Deposits: Paused'
  } else if (withdrawalsPaused) {
    pauseLabel = 'Withdrawals: Paused'
  }

  return { kybLabel, pauseLabel }
}

export function EligibilityIndicator({ eligibility }: EligibilityIndicatorProps) {
  const { kybLabel, pauseLabel } = getStatusParts(eligibility)
  const isNotAuthorized = isEligibilityReason(eligibility.depositBlockReason)
  const hasPause = pauseLabel !== null

  return (
    <div
      data-testid="EligibilityIndicator"
      className={cn(
        'inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium',
        isNotAuthorized
          ? 'bg-st-error/10 text-st-error'
          : hasPause
            ? 'bg-st-info/10 text-st-info'
            : 'bg-st-success/10 text-st-success',
      )}
    >
      <Span variant="body-s" className="font-semibold">
        {kybLabel}
        {pauseLabel && ` | ${pauseLabel}`}
      </Span>
    </div>
  )
}

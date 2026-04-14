'use client'

import { StackableBanner } from '@/components/StackableBanner/StackableBanner'

import { useEpochState } from '../../hooks/useEpochState'
import { DepositWindowSection } from './DepositWindowSection'

/**
 * Banner shown when the epoch is open and accepting requests. Displays the current deposit window
 * number, the closing date, and a live countdown until the epoch closes. Only rendered when
 * isAcceptingRequests and endTime are present (caller ensures connected + eligible).
 */
export function DepositWindowBanner() {
  const { data: epoch } = useEpochState()

  if (!epoch?.isAcceptingRequests || epoch?.endTime == null) {
    return null
  }

  return (
    <StackableBanner testId="DepositWindowBanner">
      <DepositWindowSection epoch={epoch} />
    </StackableBanner>
  )
}

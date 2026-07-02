import posthog from 'posthog-js'
import { useEffect, useRef } from 'react'

import { isUserRejectedTxError, txFailureProps } from '@/components/ErrorPage/commonErrors'

import { ClaimRewardType } from './types'

interface Params {
  error: unknown
  rewardType: ClaimRewardType
  hash?: `0x${string}`
}

/**
 * Emits the `rewards_claim_failed` PostHog event when a claim transaction error appears.
 * Shared by the backer and builder claim modals so both stay in sync.
 *
 * User rejections are skipped (matching `executeTxFlow`'s convention elsewhere) since a
 * rejection isn't a failure. Each distinct error is captured only once, even if unrelated
 * deps (e.g. `rewardType`) change while the same error is still set.
 */
export const useRewardsClaimFailedCapture = (
  recipientType: 'backer' | 'builder',
  { error, rewardType, hash }: Params,
) => {
  const capturedErrorRef = useRef<unknown>(null)

  useEffect(() => {
    if (!error || error === capturedErrorRef.current) return
    capturedErrorRef.current = error

    if (isUserRejectedTxError(error)) return

    posthog.capture('rewards_claim_failed', {
      recipient_type: recipientType,
      reward_type: rewardType,
      ...txFailureProps(error),
      tx_hash: hash,
    })
  }, [recipientType, error, rewardType, hash])
}

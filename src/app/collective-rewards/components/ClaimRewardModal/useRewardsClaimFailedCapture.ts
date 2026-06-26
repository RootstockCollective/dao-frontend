import posthog from 'posthog-js'
import { useEffect } from 'react'

import { txFailureProps } from '@/components/ErrorPage/commonErrors'

import { ClaimRewardType } from './types'

interface Params {
  error: unknown
  rewardType: ClaimRewardType
  hash?: `0x${string}`
}

/**
 * Emits the `rewards_claim_failed` PostHog event when a claim error appears.
 * Shared by the backer and builder claim modals so both stay in sync.
 */
export const useRewardsClaimFailedCapture = (
  recipientType: 'backer' | 'builder',
  { error, rewardType, hash }: Params,
) => {
  useEffect(() => {
    if (!error) return
    posthog.capture('rewards_claim_failed', {
      recipient_type: recipientType,
      reward_type: rewardType,
      ...txFailureProps(error),
      tx_hash: hash,
    })
  }, [recipientType, error, rewardType, hash])
}

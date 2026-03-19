'use client'

import { StackableBanner } from '@/components/StackableBanner/StackableBanner'

import { useEpochState } from '../hooks/useEpochState'
import { useKybStatus } from '../hooks/useKybStatus'
import { DepositWindowSection } from './DepositWindowSection'
import { EligibilityBannerContent } from './EligibilityBannerContent'

const ELIGIBILITY_DEPOSIT_CARD_GRADIENT = 'linear-gradient(to right, #FAF9E3, #2D567E)'

/**
 * Combined gradient card for BTC Vault: ELIGIBILITY section (when KYB is none or rejected) and
 * DEPOSIT WINDOW section (when epoch is open). When KYB is passed and epoch is closed, the card
 * is hidden to avoid an empty box.
 */
export function BtcVaultEligibilityAndDepositCard() {
  const { status, rejectionReason } = useKybStatus()
  const { data: epoch } = useEpochState()

  const showEligibility = status !== 'passed'
  const showDepositWindow = Boolean(epoch?.isAcceptingRequests && epoch?.endTime != null)

  if (!showEligibility && !showDepositWindow) {
    return null
  }

  return (
    <StackableBanner
      testId="btc-vault-eligibility-and-deposit-card"
      background={ELIGIBILITY_DEPOSIT_CARD_GRADIENT}
    >
      {showEligibility && (
        <EligibilityBannerContent
          variant={status === 'rejected' ? 'rejected' : 'none'}
          rejectionReason={rejectionReason}
          onSubmitKyb={() => {}}
          onCheckStatus={() => {}}
        />
      )}
      {showDepositWindow && epoch && <DepositWindowSection epoch={epoch} />}
    </StackableBanner>
  )
}

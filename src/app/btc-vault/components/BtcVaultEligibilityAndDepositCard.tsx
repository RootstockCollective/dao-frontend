'use client'

import type { ReactNode } from 'react'

import { StackableBanner } from '@/components/StackableBanner/StackableBanner'
import { Label } from '@/components/Typography'

import { useEpochState } from '../hooks/useEpochState'
import { useKybStatus } from '../hooks/useKybStatus'
import {
  ELIGIBILITY_DEPOSIT_CARD_DEBRIS_CREAM,
  ELIGIBILITY_DEPOSIT_CARD_DEBRIS_DARK,
  ELIGIBILITY_DEPOSIT_CARD_GRADIENT,
} from './btcVaultBannerGradients'
import { BtcVaultPrototypeBannerContent } from './BtcVaultPrototypeBannerContent'
import { DepositWindowSection } from './DepositWindowSection'
import { EligibilityBannerContent } from './EligibilityBannerContent'

const KYB_PASSED_WINDOW_CLOSED = 'KYB approved. Deposit window is currently closed.'

/**
 * Combined gradient card for BTC Vault: ELIGIBILITY section (when KYB is none or rejected) and
 * DEPOSIT WINDOW section (when epoch is open). When KYB is passed and epoch is closed, we still
 * show the card with a short message so Re-submit (randomization) never makes the card disappear.
 */
export function BtcVaultEligibilityAndDepositCard() {
  const { status, rejectionReason } = useKybStatus()
  const { data: epoch } = useEpochState()

  const showEligibility = status !== 'passed'
  const showDepositWindow = Boolean(epoch?.isAcceptingRequests && epoch?.endTime != null)
  const showPassedClosed = status === 'passed' && !showDepositWindow

  const sections: ReactNode[] = [<BtcVaultPrototypeBannerContent key="btc-vault-prototype" />]
  if (showEligibility) {
    sections.push(
      <EligibilityBannerContent
        key="eligibility"
        variant={status === 'rejected' ? 'rejected' : 'none'}
        rejectionReason={rejectionReason}
      />,
    )
  }
  if (showDepositWindow && epoch) {
    sections.push(<DepositWindowSection key="deposit-window" epoch={epoch} />)
  }
  if (showPassedClosed) {
    sections.push(
      <Label key="passed-closed" variant="body-l" className="text-v3-text-0 leading-[133%]">
        {KYB_PASSED_WINDOW_CLOSED}
      </Label>,
    )
  }

  return (
    <StackableBanner
      testId="btc-vault-eligibility-and-deposit-card"
      background={ELIGIBILITY_DEPOSIT_CARD_GRADIENT}
      className="isolate py-6 px-10"
      mobileBackground={ELIGIBILITY_DEPOSIT_CARD_GRADIENT}
      decorativeImageColor={ELIGIBILITY_DEPOSIT_CARD_DEBRIS_CREAM}
      decorativeSecondaryColor={ELIGIBILITY_DEPOSIT_CARD_DEBRIS_DARK}
    >
      {sections}
    </StackableBanner>
  )
}

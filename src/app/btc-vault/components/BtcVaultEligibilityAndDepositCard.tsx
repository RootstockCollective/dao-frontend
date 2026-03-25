'use client'

import type { ReactNode } from 'react'

import { StackableBanner } from '@/components/StackableBanner/StackableBanner'
import { Label } from '@/components/Typography'

import { useEpochState } from '../hooks/useEpochState'
import { useKybStatus } from '../hooks/useKybStatus'
import { DepositWindowSection } from './DepositWindowSection'
import { EligibilityBannerContent } from './EligibilityBannerContent'

/** Figma Frame 2018783054: 270deg, blue → cream at 52.61%. */
const ELIGIBILITY_DEPOSIT_CARD_GRADIENT = 'linear-gradient(270deg, #0D4F7B 0%, #FFFDD9 52.61%)'
/** Debris: cream matches gradient left; dark square uses page background so no blue shows at corner. */
const DEBRIS_COLOR_CREAM = '#FFFDD9'
const DEBRIS_COLOR_DARK = '#171412'

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

  const sections: ReactNode[] = []
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
      decorativeImageColor={DEBRIS_COLOR_CREAM}
      decorativeSecondaryColor={DEBRIS_COLOR_DARK}
    >
      {sections}
    </StackableBanner>
  )
}

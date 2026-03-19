'use client'

import type { ReactNode } from 'react'
import { useAccount } from 'wagmi'

import { StackableBanner } from '@/components/StackableBanner/StackableBanner'
import { Header } from '@/components/Typography'

import { BtcVaultEligibilityAndDepositCard } from './components/BtcVaultEligibilityAndDepositCard'
import { DepositWindowSection } from './components/DepositWindowSection'
import { DisclosureContent } from './components/DisclosureContent'
import { useEpochState } from './hooks/useEpochState'

const DisclosureSection = () => (
  <div className="flex flex-col gap-4">
    <Header variant="h3">DISCLOSURE</Header>
    <DisclosureContent variant="banner" />
  </div>
)

/**
 * BTC Vault banners: When not connected, show Deposit Window (if epoch open) above Disclosure in one banner.
 * When connected, show KYB eligibility + deposit window card. Whitelisting happens after KYB.
 */
export const BtcVaultBanners = () => {
  const { address, isConnected } = useAccount()
  const { data: epoch } = useEpochState()

  if (!address || !isConnected) {
    const showDepositWindow = Boolean(epoch?.isAcceptingRequests && epoch?.endTime != null)
    const sections: ReactNode[] = []
    if (showDepositWindow && epoch) {
      sections.push(<DepositWindowSection key="deposit-window" epoch={epoch} />)
    }
    sections.push(<DisclosureSection key="disclosure" />)

    return <StackableBanner testId="DisclosureBanner">{sections}</StackableBanner>
  }

  return <BtcVaultEligibilityAndDepositCard />
}

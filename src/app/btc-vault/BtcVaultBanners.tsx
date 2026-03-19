'use client'

import { useAccount } from 'wagmi'

import { StackableBanner } from '@/components/StackableBanner/StackableBanner'
import { Header } from '@/components/Typography'

import { BtcVaultEligibilityAndDepositCard } from './components/BtcVaultEligibilityAndDepositCard'
import { DisclosureContent } from './components/DisclosureContent'

const DisclosureBanner = () => (
  <StackableBanner testId="DisclosureBanner">
    <div className="flex flex-col gap-4">
      <Header variant="h3">DISCLOSURE</Header>
      <DisclosureContent variant="banner" />
    </div>
  </StackableBanner>
)

/**
 * BTC Vault banners: Disclosure when not connected; KYB eligibility + deposit window when connected.
 * Whitelisting happens after KYB, so all connected users see the eligibility card (No KYB by default).
 */
export const BtcVaultBanners = () => {
  const { address, isConnected } = useAccount()

  if (!address || !isConnected) {
    return <DisclosureBanner />
  }

  return <BtcVaultEligibilityAndDepositCard />
}

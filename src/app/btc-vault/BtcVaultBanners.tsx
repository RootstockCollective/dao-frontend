'use client'

import { useAccount } from 'wagmi'

import { BannerContent } from '@/components/StackableBanner/BannerContent'
import { StackableBanner } from '@/components/StackableBanner/StackableBanner'
import { Header } from '@/components/Typography'

import { BtcVaultEligibilityAndDepositCard } from './components/BtcVaultEligibilityAndDepositCard'
import { DisclosureContent } from './components/DisclosureContent'
import { useActionEligibility } from './hooks/useActionEligibility'

/** Block reasons from pause or active request; any other non-empty reason is eligibility (not authorized). */
const PAUSE_BLOCK_REASON = 'Deposits are currently paused'
const ACTIVE_REQUEST_BLOCK_REASON = 'You already have an active request'

function isEligibilityBlockReason(reason: string): boolean {
  return reason.length > 0 && reason !== PAUSE_BLOCK_REASON && reason !== ACTIVE_REQUEST_BLOCK_REASON
}

const NotAuthorizedBanner = ({ reason }: { reason?: string }) => {
  return (
    <StackableBanner testId="NotAuthorizedBanner">
      <BannerContent
        title="Not Authorized"
        description={
          reason ||
          'This wallet is not authorized to interact with the BTC Vault. Contact your administrator.'
        }
        buttonOnClick={() => {}}
      />
    </StackableBanner>
  )
}

const DisclosureBanner = () => (
  <StackableBanner testId="DisclosureBanner">
    <div className="flex flex-col gap-4">
      <Header variant="h3">DISCLOSURE</Header>
      <DisclosureContent variant="banner" />
    </div>
  </StackableBanner>
)

export const BtcVaultBanners = () => {
  const { address, isConnected } = useAccount()
  const { data: actionEligibility } = useActionEligibility(address)

  if (!address || !isConnected) {
    return <DisclosureBanner />
  }

  if (actionEligibility && isEligibilityBlockReason(actionEligibility.depositBlockReason)) {
    return <NotAuthorizedBanner reason={actionEligibility.depositBlockReason} />
  }

  return <BtcVaultEligibilityAndDepositCard />
}

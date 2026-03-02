'use client'

import { StackableBanner } from '@/components/StackableBanner/StackableBanner'
import { BannerContent } from '@/components/StackableBanner/BannerContent'
import { useAppKitFlow } from '@/shared/walletConnection/connection/useAppKitFlow'
import { useAccount } from 'wagmi'
import { useActionEligibility } from './hooks/useActionEligibility'

/** Block reasons from pause or active request; any other non-empty reason is eligibility (not authorized). */
const PAUSE_BLOCK_REASON = 'Deposits are currently paused'
const ACTIVE_REQUEST_BLOCK_REASON = 'You already have an active request'

function isEligibilityBlockReason(reason: string): boolean {
  return reason.length > 0 && reason !== PAUSE_BLOCK_REASON && reason !== ACTIVE_REQUEST_BLOCK_REASON
}

const WalletDisconnectedBanner = () => {
  const { onConnectWalletButtonClick } = useAppKitFlow()

  return (
    <StackableBanner testId="WalletDisconnectedBanner">
      <BannerContent
        title="Wallet Disconnected"
        description="Wallet disconnected — reconnect to continue"
        buttonText="Connect Wallet"
        buttonOnClick={onConnectWalletButtonClick}
      />
    </StackableBanner>
  )
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

export const BtcVaultBanners = () => {
  const { address, isConnected } = useAccount()
  const { data: actionEligibility } = useActionEligibility(address)

  if (!address || !isConnected) {
    return <WalletDisconnectedBanner />
  }

  if (actionEligibility && isEligibilityBlockReason(actionEligibility.depositBlockReason)) {
    return <NotAuthorizedBanner reason={actionEligibility.depositBlockReason} />
  }

  return null
}

'use client'

import { StackableBanner } from '@/components/StackableBanner/StackableBanner'
import { BannerContent } from '@/components/StackableBanner/BannerContent'
import { useAppKitFlow } from '@/shared/walletConnection/connection/useAppKitFlow'
import { useAccount } from 'wagmi'
import { useActionEligibility } from './hooks/useActionEligibility'
import type { ActionEligibility } from './services/ui/types'

export const DEPOSIT_PAUSE_REASON = 'Deposits are currently paused'
export const WITHDRAWAL_PAUSE_REASON = 'Withdrawals are currently paused'
export const ACTIVE_REQUEST_REASON = 'You already have an active request'

function isEligibilityBlockReason(reason: string): boolean {
  return (
    reason.length > 0 &&
    reason !== DEPOSIT_PAUSE_REASON &&
    reason !== WITHDRAWAL_PAUSE_REASON &&
    reason !== ACTIVE_REQUEST_REASON
  )
}

function getPauseVariant(eligibility: ActionEligibility): 'deposits' | 'withdrawals' | 'vault' | null {
  const depositsPaused = eligibility.depositBlockReason === DEPOSIT_PAUSE_REASON
  const withdrawalsPaused = eligibility.withdrawBlockReason === WITHDRAWAL_PAUSE_REASON

  if (depositsPaused && withdrawalsPaused) return 'vault'
  if (depositsPaused) return 'deposits'
  if (withdrawalsPaused) return 'withdrawals'
  return null
}

const PAUSE_BANNER_CONFIG = {
  deposits: {
    title: 'Deposits Paused',
    description: 'Deposit operations are temporarily paused. Existing requests are unaffected.',
  },
  withdrawals: {
    title: 'Withdrawals Paused',
    description: 'Withdrawal operations are temporarily paused. Existing requests are unaffected.',
  },
  vault: {
    title: 'Vault Paused',
    description: 'All vault operations are temporarily paused. Existing requests are unaffected.',
  },
} as const

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

const PauseBanner = ({ variant }: { variant: 'deposits' | 'withdrawals' | 'vault' }) => {
  const config = PAUSE_BANNER_CONFIG[variant]
  return (
    <StackableBanner testId="PauseBanner">
      <BannerContent title={config.title} description={config.description} buttonOnClick={() => {}} />
    </StackableBanner>
  )
}

export const BtcVaultBanners = () => {
  const { address, isConnected } = useAccount()
  const { data: actionEligibility } = useActionEligibility(address)

  if (!address || !isConnected) {
    return <WalletDisconnectedBanner />
  }

  if (!actionEligibility) return null

  const isNotAuthorized = isEligibilityBlockReason(actionEligibility.depositBlockReason)
  const pauseVariant = getPauseVariant(actionEligibility)

  return (
    <>
      {isNotAuthorized && <NotAuthorizedBanner reason={actionEligibility.depositBlockReason} />}
      {pauseVariant && <PauseBanner variant={pauseVariant} />}
    </>
  )
}

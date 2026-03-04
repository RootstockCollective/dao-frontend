'use client'

import { BannerContent } from '@/components/StackableBanner/BannerContent'
import { StackableBanner } from '@/components/StackableBanner/StackableBanner'
import { useAppKitFlow } from '@/shared/walletConnection/connection/useAppKitFlow'

import { useActionEligibility } from './hooks/useActionEligibility'
import {
  ELIGIBILITY_REASON_DEPOSITS_PAUSED,
  ELIGIBILITY_REASON_DISCONNECTED,
  ELIGIBILITY_REASON_ELIGIBLE,
  ELIGIBILITY_REASON_LOADING,
  ELIGIBILITY_REASON_NOT_AUTHORIZED,
  ELIGIBILITY_REASON_WITHDRAWALS_PAUSED,
} from './services/ui/eligibilityReasons'

const WalletDisconnectedBanner = () => {
  const { onConnectWalletButtonClick } = useAppKitFlow()

  return (
    <StackableBanner testId="WalletDisconnectedBanner">
      <BannerContent
        title="Wallet Disconnected"
        description={ELIGIBILITY_REASON_DISCONNECTED}
        buttonText="Connect Wallet"
        buttonOnClick={onConnectWalletButtonClick}
      />
    </StackableBanner>
  )
}

const NotAuthorizedBanner = ({ reason }: { reason: string }) => (
  <StackableBanner testId="NotAuthorizedBanner">
    <BannerContent title="Not Authorized" description={reason} buttonOnClick={() => {}} />
  </StackableBanner>
)

const DepositsPausedBanner = () => (
  <StackableBanner testId="DepositsPausedBanner">
    <BannerContent
      title="Deposits Paused"
      description={ELIGIBILITY_REASON_DEPOSITS_PAUSED}
      buttonOnClick={() => {}}
    />
  </StackableBanner>
)

const WithdrawalsPausedBanner = () => (
  <StackableBanner testId="WithdrawalsPausedBanner">
    <BannerContent
      title="Withdrawals Paused"
      description={ELIGIBILITY_REASON_WITHDRAWALS_PAUSED}
      buttonOnClick={() => {}}
    />
  </StackableBanner>
)

export const BtcVaultBanners = () => {
  const { isEligible, reason } = useActionEligibility()

  if (isEligible || reason === ELIGIBILITY_REASON_ELIGIBLE || reason === ELIGIBILITY_REASON_LOADING) {
    return null
  }

  if (reason === ELIGIBILITY_REASON_DISCONNECTED) {
    return <WalletDisconnectedBanner />
  }
  if (reason === ELIGIBILITY_REASON_NOT_AUTHORIZED) {
    return <NotAuthorizedBanner reason={reason} />
  }
  if (reason === ELIGIBILITY_REASON_DEPOSITS_PAUSED) {
    return <DepositsPausedBanner />
  }
  if (reason === ELIGIBILITY_REASON_WITHDRAWALS_PAUSED) {
    return <WithdrawalsPausedBanner />
  }

  return null
}

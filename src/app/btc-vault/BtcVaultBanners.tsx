'use client'

import type { ReactNode } from 'react'
import { useAccount } from 'wagmi'

import { StackableBanner } from '@/components/StackableBanner/StackableBanner'
import { Header } from '@/components/Typography'

import {
  ELIGIBILITY_DEPOSIT_CARD_DEBRIS_CREAM,
  ELIGIBILITY_DEPOSIT_CARD_DEBRIS_DARK,
  ELIGIBILITY_DEPOSIT_CARD_GRADIENT,
} from './components/btcVaultBannerGradients'
import { BtcVaultEligibilityAndDepositCard } from './components/BtcVaultEligibilityAndDepositCard'
import { BtcVaultPrototypeBannerContent } from './components/BtcVaultPrototypeBannerContent'
import { DepositWindowSection } from './components/DepositWindowSection'
import { DisclosureContent } from './components/DisclosureContent'
import { PauseBannerContent } from './components/PauseBannerContent'
import { useActionEligibility } from './hooks/useActionEligibility'
import { useEpochState } from './hooks/useEpochState'

const PAUSE_BANNER_GRADIENT = 'linear-gradient(270deg, #64280C 0%, #DD9E52 33.69%, #FFF5E1 52.83%)'

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

  const { data: eligibilityData } = useActionEligibility(address)

  if (!address || !isConnected) {
    const showDepositWindow = Boolean(epoch?.isAcceptingRequests && epoch?.endTime != null)
    const sections: ReactNode[] = [<BtcVaultPrototypeBannerContent key="btc-vault-prototype" />]
    if (showDepositWindow && epoch) {
      sections.push(<DepositWindowSection key="deposit-window" epoch={epoch} />)
    }
    sections.push(<DisclosureSection key="disclosure" />)

    return (
      <StackableBanner
        testId="DisclosureBanner"
        background={ELIGIBILITY_DEPOSIT_CARD_GRADIENT}
        mobileBackground={ELIGIBILITY_DEPOSIT_CARD_GRADIENT}
        decorativeImageColor={ELIGIBILITY_DEPOSIT_CARD_DEBRIS_CREAM}
        decorativeSecondaryColor={ELIGIBILITY_DEPOSIT_CARD_DEBRIS_DARK}
        className="isolate"
      >
        {sections}
      </StackableBanner>
    )
  }

  const pauseState = eligibilityData?.pauseState
  const showPauseBanner =
    pauseState && (pauseState.deposits === 'paused' || pauseState.withdrawals === 'paused')

  return (
    <>
      {showPauseBanner && (
        <StackableBanner
          testId="PauseBanner"
          background={PAUSE_BANNER_GRADIENT}
          mobileBackground={PAUSE_BANNER_GRADIENT}
          decorativeImageColor="#FFF5E1"
          decorativeSecondaryColor="#171412"
        >
          <PauseBannerContent pauseState={pauseState} />
        </StackableBanner>
      )}
      <BtcVaultEligibilityAndDepositCard />
    </>
  )
}

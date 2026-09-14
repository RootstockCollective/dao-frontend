'use client'

import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

import { BackerRewardsContextProvider } from '@/app/collective-rewards/rewards'
import { CommonComponentProps } from '@/components/commonProps'
import { PageBanner } from '@/components/PageBanner'
import { Header, Span } from '@/components/Typography'
import { TOKENS } from '@/lib/tokens'
import { formatCurrency } from '@/lib/utils'

import { useHoldingsMetrics } from './useHoldingsMetrics'

const BANNER_IMAGE_SRC = '/images/holdings-banner-bg.webp'

const DISCONNECTED_DESCRIPTION =
  'Connect your wallet to see your RIF, stRIF, USDRIF and rBTC, claim rewards and start backing builders.'
const CONNECTED_DESCRIPTION =
  'Your RIF, stRIF, USDRIF and rBTC in one place. Claim rewards, manage backing and track your position across cycles.'

const BannerMetric = ({ title, value }: { title: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <Span caps variant="tag" className="text-v3-text-60">
      {title}
    </Span>
    <Header variant="h3">{value}</Header>
  </div>
)

const HoldingsMetrics = () => {
  const { unclaimedRewards, portfolioValue, availableBackingPercentage } = useHoldingsMetrics()

  return (
    <div
      className="flex flex-col gap-4 divide-v3-text-100/20 md:flex-row md:gap-0 md:divide-x"
      data-testid="HoldingsMetrics"
    >
      <div className="md:pr-8">
        <BannerMetric title="Unclaimed rewards" value={formatCurrency(unclaimedRewards)} />
      </div>
      <div className="md:px-8">
        <BannerMetric title="Available backing" value={`${Math.round(availableBackingPercentage)}%`} />
      </div>
      <div className="md:pl-8">
        <BannerMetric title="Portfolio value" value={formatCurrency(portfolioValue)} />
      </div>
    </div>
  )
}

/** Permanent banner: it introduces the page rather than announcing something dismissible. */
export const HoldingsBanner = ({ className }: CommonComponentProps) => {
  const { address, isConnected } = useAccount()

  return (
    <PageBanner
      dataTestId="HoldingsBanner"
      imageSrc={BANNER_IMAGE_SRC}
      eyebrow="My Collective"
      title="Holdings"
      description={isConnected ? CONNECTED_DESCRIPTION : DISCONNECTED_DESCRIPTION}
      className={className}
    >
      {isConnected && (
        <BackerRewardsContextProvider backer={address ?? zeroAddress} tokens={TOKENS}>
          <HoldingsMetrics />
        </BackerRewardsContextProvider>
      )}
    </PageBanner>
  )
}

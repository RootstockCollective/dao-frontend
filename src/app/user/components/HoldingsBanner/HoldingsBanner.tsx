'use client'

import { ReactNode } from 'react'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

import { BackerRewardsContextProvider } from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { CommonComponentProps } from '@/components/commonProps'
import { PageBanner } from '@/components/PageBanner'
import { Header, Span } from '@/components/Typography'
import { TOKENS } from '@/lib/tokens'
import { formatCurrency } from '@/lib/utils'

import { type HoldingsMetricStatus, useHoldingsMetrics } from './useHoldingsMetrics'

const BANNER_IMAGE_SRC = '/images/holdings-banner-bg.webp'

const DISCONNECTED_DESCRIPTION =
  'Connect your wallet to see your RIF, stRIF, USDRIF and rBTC, claim rewards and start backing builders.'
const CONNECTED_DESCRIPTION =
  'Your RIF, stRIF, USDRIF and rBTC in one place. Claim rewards, manage backing and track your position across cycles.'

const UNAVAILABLE_VALUE = '—'

interface BannerMetricProps {
  title: string
  status: HoldingsMetricStatus
  children: ReactNode
  'data-testid'?: string
}

/**
 * One headline number. While it loads it holds a skeleton of the value's height, so the
 * banner does not jump when it resolves; if its source failed it shows a dash rather than
 * a zero the holder could mistake for their balance.
 */
const BannerMetric = ({ title, status, children, 'data-testid': dataTestId }: BannerMetricProps) => (
  <div className="flex flex-col gap-1" aria-busy={status === 'loading'} data-testid={dataTestId}>
    <Span caps variant="tag" className="text-v3-text-60">
      {title}
    </Span>
    <div className="flex min-h-8 items-center">
      {status === 'loading' && (
        <>
          <span
            aria-hidden="true"
            className="block h-6 w-24 rounded-sm bg-v3-text-100/10 motion-safe:animate-pulse"
            data-testid="HoldingsMetricSkeleton"
          />
          <span className="sr-only">Loading</span>
        </>
      )}
      {status === 'error' && (
        <Header variant="h3" title="This value could not be loaded">
          <span aria-hidden="true">{UNAVAILABLE_VALUE}</span>
          <span className="sr-only">Unavailable</span>
        </Header>
      )}
      {status === 'ready' && <Header variant="h3">{children}</Header>}
    </div>
  </div>
)

const HoldingsMetrics = () => {
  const { unclaimedRewards, portfolioValue, availableBackingPercentage, error } = useHoldingsMetrics()

  useHandleErrors({ error, title: 'Error loading your holdings' })

  return (
    <div
      className="flex flex-col gap-4 divide-v3-text-100/20 md:flex-row md:gap-0 md:divide-x"
      data-testid="HoldingsMetrics"
    >
      <div className="md:pr-8">
        <BannerMetric
          title="Unclaimed rewards"
          status={unclaimedRewards.status}
          data-testid="HoldingsUnclaimedRewards"
        >
          {formatCurrency(unclaimedRewards.value)}
        </BannerMetric>
      </div>
      <div className="md:px-8">
        <BannerMetric
          title="Available backing"
          status={availableBackingPercentage.status}
          data-testid="HoldingsAvailableBacking"
        >
          {`${Math.round(availableBackingPercentage.value)}%`}
        </BannerMetric>
      </div>
      <div className="md:pl-8">
        <BannerMetric
          title="Portfolio value"
          status={portfolioValue.status}
          data-testid="HoldingsPortfolioValue"
        >
          {formatCurrency(portfolioValue.value)}
        </BannerMetric>
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

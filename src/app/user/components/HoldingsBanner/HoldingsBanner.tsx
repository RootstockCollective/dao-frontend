'use client'

import { ReactNode } from 'react'
import { useAccount } from 'wagmi'

import { useHandleErrors } from '@/app/collective-rewards/utils'
import { CommonComponentProps } from '@/components/commonProps'
import { PageBanner } from '@/components/PageBanner'
import { Header, Span } from '@/components/Typography'
import { formatCurrency } from '@/lib/utils'

import { type HoldingsMetricStatus, useHoldingsMetrics } from './useHoldingsMetrics'

const BANNER_IMAGE_SRC = '/images/holdings-banner-bg.webp'

const DISCONNECTED_DESCRIPTION =
  'Connect your wallet to see your RIF, stRIF, USDRIF and rBTC, claim rewards and start backing builders.'
const CONNECTED_DESCRIPTION =
  'Your RIF, stRIF, USDRIF and rBTC in one place. Claim rewards, manage backing and track your position across cycles.'

const UNAVAILABLE_VALUE = '—'

interface DashValueProps {
  reason: string
  label: string
}

const DashValue = ({ reason, label }: DashValueProps) => (
  <Header variant="h3" title={reason}>
    <span aria-hidden="true">{UNAVAILABLE_VALUE}</span>
    <span className="sr-only">{label}</span>
  </Header>
)

interface BannerMetricProps {
  title: string
  status: HoldingsMetricStatus
  children: ReactNode
  emptyReason?: string
  'data-testid'?: string
}

const BannerMetric = ({
  title,
  status,
  emptyReason = 'Nothing to show yet',
  children,
  'data-testid': dataTestId,
}: BannerMetricProps) => (
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
      {status === 'error' && <DashValue reason="This value could not be loaded" label="Unavailable" />}
      {status === 'empty' && <DashValue reason={emptyReason} label={emptyReason} />}
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
          emptyReason="No stRIF to back builders with"
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

export const HoldingsBanner = ({ className }: CommonComponentProps) => {
  const { isConnected } = useAccount()

  return (
    <PageBanner
      dataTestId="HoldingsBanner"
      imageSrc={BANNER_IMAGE_SRC}
      eyebrow="My Collective"
      title="Holdings"
      description={isConnected ? CONNECTED_DESCRIPTION : DISCONNECTED_DESCRIPTION}
      className={className}
    >
      {isConnected && <HoldingsMetrics />}
    </PageBanner>
  )
}

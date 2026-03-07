'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Paragraph } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import { useRbtcAsyncVaultMetrics } from '../hooks/useRbtcAsyncVaultMetrics'
import { RbtcVaultMetricCard } from './RbtcVaultMetricCard'
import { RbtcVaultMetricsRow } from './RbtcVaultMetricsRow'

export const RbtcVaultMetricsSection = () => {
  const {
    currentNav,
    deployedCapital,
    unallocatedCapital,
    manualBuffer,
    isLoading: isLoadingAsyncVaultMetrics,
    error: errorAsyncVaultMetrics,
  } = useRbtcAsyncVaultMetrics()

  const isLoading = isLoadingAsyncVaultMetrics
  const error = errorAsyncVaultMetrics

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 rounded-sm bg-v3-bg-accent-80 w-full min-h-[180px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 rounded-sm bg-v3-bg-accent-80 w-full min-h-[180px]">
        <Paragraph variant="body" className="text-st-error">
          Failed to load vault metrics. Please try again later.
        </Paragraph>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 items-start p-6 rounded-sm bg-v3-bg-accent-80 w-full">
      {/* Row 1 */}
      <RbtcVaultMetricsRow>
        <></>
      </RbtcVaultMetricsRow>

      {/* Row 2 */}
      <RbtcVaultMetricsRow>
        <RbtcVaultMetricCard
          title="Current NAV"
          tooltipContent=""
          amount={currentNav.amount}
          tokenSymbol={RBTC}
          fiatAmount={currentNav.fiatAmount}
          buttonLabel="Update NAV"
          buttonVariant="primary"
        />
        <RbtcVaultMetricCard
          title="Deployed Capital"
          tooltipContent=""
          amount={deployedCapital.amount}
          tokenSymbol={RBTC}
          fiatAmount={deployedCapital.fiatAmount}
          buttonLabel="Deposit to Vault"
        />
        <RbtcVaultMetricCard
          title="Unallocated Capital"
          tooltipContent=""
          amount={unallocatedCapital.amount}
          tokenSymbol={RBTC}
          fiatAmount={unallocatedCapital.fiatAmount}
          buttonLabel="Transfer to Manager Wallet"
        />
        <RbtcVaultMetricCard
          title="Manual Buffer"
          tooltipContent=""
          amount={manualBuffer.amount}
          tokenSymbol={RBTC}
          fiatAmount={manualBuffer.fiatAmount}
          buttonLabel="Top Up Buffer"
        />
      </RbtcVaultMetricsRow>

      {/* Row 3 */}
      <RbtcVaultMetricsRow>
        <></>
      </RbtcVaultMetricsRow>
    </div>
  )
}

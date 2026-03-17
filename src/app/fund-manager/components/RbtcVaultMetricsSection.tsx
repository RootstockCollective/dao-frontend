'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Paragraph } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import { useRbtcVaultMetrics } from '../hooks/useRbtcVaultMetrics'
import { RbtcVaultMetricCard } from './RbtcVaultMetricCard'
import { RbtcVaultMetricsRow } from './RbtcVaultMetricsRow'

export const RbtcVaultMetricsSection = () => {
  const { tvl, vaultApy, syntheticYieldApy, liquidityReserve, isLoading, error } = useRbtcVaultMetrics()

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
        <RbtcVaultMetricCard
          title="TVL"
          tooltipContent=""
          amount={tvl.amount}
          tokenSymbol={RBTC}
          fiatAmount={tvl.fiatAmount}
        />
        <RbtcVaultMetricCard title="Vault APY" tooltipContent="" amount={vaultApy} />
        <RbtcVaultMetricCard
          title="Synthetic Yield APY"
          tooltipContent=""
          amount={syntheticYieldApy}
          buttonLabel="Top Up Synthetic Yield APY"
        />
        <RbtcVaultMetricCard
          title="Liquidity Reserve"
          tooltipContent=""
          amount={liquidityReserve.amount}
          tokenSymbol={RBTC}
          fiatAmount={liquidityReserve.fiatAmount}
        />
      </RbtcVaultMetricsRow>

      {/* Row 2 */}
      <RbtcVaultMetricsRow>
        <></>
      </RbtcVaultMetricsRow>

      {/* Row 3 */}
      <RbtcVaultMetricsRow>
        <></>
      </RbtcVaultMetricsRow>
    </div>
  )
}

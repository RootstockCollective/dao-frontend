'use client'

import { AnnualBackerIncentivesLoader } from '@/app/shared/components/AnnualBackersIncentivesLoader/AnnualBackerIncentivesLoader'
import { RIF, STRIF } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'

import { useCycleDashboard } from '../../context/CycleDashboardContext'
import { DashboardMetricsContent } from './DashboardMetricsContent'

export const DashboardMetrics = ({ className }: { className?: string }) => {
  const { selectedCycle, paidAllTime, buildersCount, isLoading } = useCycleDashboard()
  const { prices } = usePricesContext()

  // stRIF is staked RIF one-for-one, so the RIF price stands in if stRIF isn't quoted.
  const strifPrice = prices[STRIF]?.price ?? prices[RIF]?.price ?? 0

  return (
    <AnnualBackerIncentivesLoader
      render={({ data: abiPct, isLoading: isAbiLoading }) => (
        <DashboardMetricsContent
          cycle={selectedCycle}
          abiPct={abiPct.toNumber()}
          paidAllTime={paidAllTime}
          buildersCount={buildersCount}
          strifPrice={strifPrice}
          isLoading={isLoading || isAbiLoading}
          className={className}
        />
      )}
    />
  )
}

'use client'

import { useMemo } from 'react'

import { AnnualBackerIncentivesLoader } from '@/app/shared/components/AnnualBackersIncentivesLoader/AnnualBackerIncentivesLoader'
import Big from '@/lib/big'
import { RIF, STRIF } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'

import { useGetCycleHistory } from '../../rewards/hooks/useGetCycleHistory'
import { useGetActiveBuildersCount } from '../../shared/hooks/useGetActiveBuildersCount'
import { DashboardMetricsContent } from './DashboardMetricsContent'

export const DashboardMetrics = ({ className }: { className?: string }) => {
  const { data: cycles, isLoading } = useGetCycleHistory()
  const { data: buildersData } = useGetActiveBuildersCount()
  const { prices } = usePricesContext()

  /**
   * Summed from the same cycle rows the history table renders, so the all-time figure always
   * equals the sum of the column beneath it. Deriving it from NotifyReward events instead
   * would be equally valid but could drift from the table by a rounding step.
   */
  const paidAllTime = useMemo(
    () => cycles.reduce((acc, { rewardsFiat }) => acc.add(rewardsFiat), Big(0)),
    [cycles],
  )

  // stRIF is staked RIF one-for-one, so the RIF price stands in if stRIF isn't quoted.
  const strifPrice = prices[STRIF]?.price ?? prices[RIF]?.price ?? 0

  return (
    <AnnualBackerIncentivesLoader
      render={({ data: abiPct, isLoading: isAbiLoading }) => (
        <DashboardMetricsContent
          runningCycle={cycles[0]}
          abiPct={abiPct.toNumber()}
          paidAllTime={paidAllTime}
          buildersCount={buildersData?.count ?? null}
          strifPrice={strifPrice}
          isLoading={isLoading || isAbiLoading}
          className={className}
        />
      )}
    />
  )
}

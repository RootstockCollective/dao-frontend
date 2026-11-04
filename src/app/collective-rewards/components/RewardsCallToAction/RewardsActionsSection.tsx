'use client'

import { AnnualBackerIncentivesLoader } from '@/app/shared/components/AnnualBackersIncentivesLoader/AnnualBackerIncentivesLoader'
import { RIF } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { usePricesContext } from '@/shared/context/PricesContext'

import { PositionSimulator } from '../PositionSimulator'
import { RewardsCallToAction } from './RewardsCallToAction'

export const RewardsActionsSection = ({ className }: { className?: string }) => {
  const { prices } = usePricesContext()

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-2 items-start', className)}>
      <AnnualBackerIncentivesLoader
        render={({ data: abiPct, isLoading }) => (
          <PositionSimulator
            // `useGetABI` yields 0, not "loading", while the RIF price is still missing.
            abiPct={isLoading || !prices[RIF]?.price ? null : abiPct.toNumber()}
            rifPrice={prices[RIF]?.price ?? 0}
          />
        )}
      />

      <RewardsCallToAction />
    </div>
  )
}

'use client'

import { AnnualBackerIncentivesLoader } from '@/app/shared/components/AnnualBackersIncentivesLoader/AnnualBackerIncentivesLoader'
import { RIF } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { usePricesContext } from '@/shared/context/PricesContext'

import { PositionSimulator } from '../PositionSimulator'
import { RewardsCallToAction } from './RewardsCallToAction'

/** The simulator paired with the two calls to action, as one row on desktop. */
export const RewardsActionsSection = ({ className }: { className?: string }) => {
  const { prices } = usePricesContext()

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-2 items-start', className)}>
      <AnnualBackerIncentivesLoader
        render={({ data: abiPct }) => (
          <PositionSimulator abiPct={abiPct.toNumber()} rifPrice={prices[RIF]?.price ?? 0} />
        )}
      />

      <RewardsCallToAction />
    </div>
  )
}

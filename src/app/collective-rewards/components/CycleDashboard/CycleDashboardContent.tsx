'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { SPOT_PRICE_NOTE } from '../../constants/dashboardCopy'
import { CycleHistoryEntry } from '../../types'
import { CycleBackingChart } from '../CycleBackingChart'
import { CycleDistribution } from '../CycleDistribution'
import { CycleHistoryTable } from '../CycleHistoryTable'

/**
 * Occupies the distribution column before a cycle is selectable. Without it the fixed grid
 * column collapses to an empty 360px gap while the chart loads beside it.
 */
const DistributionPlaceholder = ({ isLoading }: { isLoading: boolean }) => (
  <div className="bg-v3-bg-accent-80 rounded-lg p-6 flex items-center justify-center min-h-[280px]">
    {isLoading ? (
      <LoadingSpinner size="small" />
    ) : (
      <Paragraph className="text-v3-text-40 text-center">No distribution to show yet</Paragraph>
    )}
  </div>
)

export interface CycleDashboardContentProps {
  cycles: CycleHistoryEntry[]
  /** The cycle the chart, panel and table all describe. */
  selectedCycle?: CycleHistoryEntry
  onSelectCycle?: (cycleNumber: number) => void
  /**
   * Active Builders right now. Applied only to the running cycle, since we have no historical
   * roster and showing today's count against a six-month-old cycle would be a quiet lie.
   */
  buildersCount?: number | null
  isLoading?: boolean
  className?: string
}

export const CycleDashboardContent = ({
  cycles,
  selectedCycle,
  onSelectCycle,
  buildersCount = null,
  isLoading = false,
  className,
}: CycleDashboardContentProps) => (
  <section
    aria-labelledby="cycle-dashboard-heading"
    className={cn('flex flex-col gap-2', className)}
    data-testid="cycle-dashboard"
  >
    <h2 id="cycle-dashboard-heading" className="sr-only">
      Backing and distribution by cycle
    </h2>

    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-2 items-start">
      <CycleBackingChart
        cycles={cycles}
        selectedCycle={selectedCycle?.cycleNumber ?? null}
        onSelectCycle={onSelectCycle}
        isLoading={isLoading}
      />

      {selectedCycle ? (
        <CycleDistribution
          cycle={selectedCycle}
          // Only the running cycle can be paired with today's Builder count.
          buildersCount={selectedCycle.status === 'running' ? buildersCount : null}
          isLoading={isLoading}
        />
      ) : (
        <DistributionPlaceholder isLoading={isLoading} />
      )}
    </div>

    <CycleHistoryTable
      cycles={cycles}
      selectedCycle={selectedCycle?.cycleNumber ?? null}
      onSelectCycle={onSelectCycle}
      isLoading={isLoading}
    />

    {/* Stated once for the whole section rather than repeated on each surface that shows USD. */}
    <Paragraph variant="body-xs" className="text-v3-text-40 px-1">
      {SPOT_PRICE_NOTE}
    </Paragraph>
  </section>
)

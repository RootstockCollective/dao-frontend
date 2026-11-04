'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { SPOT_PRICE_NOTE } from '../../constants/dashboardCopy'
import { CARD_RADIUS } from '../../constants/dashboardSurface'
import { CycleHistoryEntry } from '../../types'
import { CycleBackingChart } from '../CycleBackingChart'
import { CycleDistribution } from '../CycleDistribution'
import { CycleHistoryTable } from '../CycleHistoryTable'

const DistributionPlaceholder = ({ isLoading }: { isLoading: boolean }) => (
  <div
    className={cn(
      'bg-v3-bg-accent-80 p-6 flex h-full items-center justify-center min-h-[280px]',
      CARD_RADIUS,
    )}
  >
    {isLoading ? (
      <LoadingSpinner size="small" />
    ) : (
      <Paragraph className="text-v3-text-40 text-center">No distribution to show yet</Paragraph>
    )}
  </div>
)

export interface CycleDashboardContentProps {
  cycles: CycleHistoryEntry[]
  selectedCycle?: CycleHistoryEntry
  onSelectCycle?: (cycleNumber: number) => void
  /** Only applied to the running cycle; there is no historical Builder roster. */
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
    className={cn('flex flex-col gap-4', className)}
    data-testid="cycle-dashboard"
  >
    <h2 id="cycle-dashboard-heading" className="sr-only">
      Backing and distribution by cycle
    </h2>

    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-4 items-stretch">
      <CycleBackingChart
        cycles={cycles}
        selectedCycle={selectedCycle?.cycleNumber ?? null}
        onSelectCycle={onSelectCycle}
        isLoading={isLoading}
      />

      {selectedCycle ? (
        <CycleDistribution
          cycle={selectedCycle}
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

    <Paragraph variant="body-xs" className="text-v3-text-40 px-1">
      {SPOT_PRICE_NOTE}
    </Paragraph>
  </section>
)

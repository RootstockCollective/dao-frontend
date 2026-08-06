'use client'

import { useMemo, useState } from 'react'

import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { CycleHistoryEntry } from '../../types'
import { CycleBackingChart } from '../CycleBackingChart'
import { CycleDistribution } from '../CycleDistribution'
import { CycleHistoryTable } from '../CycleHistoryTable'

export interface CycleDashboardContentProps {
  cycles: CycleHistoryEntry[]
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
  buildersCount = null,
  isLoading = false,
  className,
}: CycleDashboardContentProps) => {
  const [selectedCycleNumber, setSelectedCycleNumber] = useState<number | null>(null)

  // Cycles arrive newest first, so the head is the one currently running.
  const runningCycle = cycles[0]
  const selectedCycle = useMemo(
    () => cycles.find(({ cycleNumber }) => cycleNumber === selectedCycleNumber) ?? runningCycle,
    [cycles, selectedCycleNumber, runningCycle],
  )

  if (!isLoading && cycles.length === 0) {
    return (
      <div className={cn('bg-v3-bg-accent-80 rounded-lg p-8 text-center', className)}>
        <Paragraph className="text-v3-text-40">No cycle history available yet</Paragraph>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)} data-testid="cycle-dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-2 items-start">
        <CycleBackingChart
          cycles={cycles}
          selectedCycle={selectedCycle?.cycleNumber ?? null}
          onSelectCycle={setSelectedCycleNumber}
          isLoading={isLoading}
        />

        {selectedCycle && (
          <CycleDistribution
            cycle={selectedCycle}
            // Only the running cycle can be paired with today's Builder count.
            buildersCount={selectedCycle.status === 'running' ? buildersCount : null}
            isLoading={isLoading}
          />
        )}
      </div>

      <CycleHistoryTable
        cycles={cycles}
        selectedCycle={selectedCycle?.cycleNumber ?? null}
        onSelectCycle={setSelectedCycleNumber}
        isLoading={isLoading}
      />
    </div>
  )
}

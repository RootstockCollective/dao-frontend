'use client'

import { ReactNode } from 'react'

import { ComparativeProgressBar } from '@/components/ComparativeProgressBar/ComparativeProgressBar'
import { Span } from '@/components/Typography'
import Big from '@/lib/big'
import { STRIF } from '@/lib/constants'
import { cn, millify } from '@/lib/utils'

import { ONE_DAY_IN_MS } from '../../constants/chartConstants'
import { SPLIT_COLORS } from '../../constants/dashboardColors'
import { CycleHistoryEntry } from '../../types'
import { formatCycleWindow, formatUsdCompact, formatUsdWhole } from '../../utils/dashboardFormatters'
import { AbiHeroCard } from './AbiHeroCard'
import { MetricCard } from './MetricCard'

const SubLabel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <Span variant="body-xs" className={cn('text-v3-text-40 truncate', className)}>
    {children}
  </Span>
)

/** Day 1 on the opening day, capped at the cycle length once the close passes. */
const getCycleProgress = (cycle: CycleHistoryEntry, nowMs: number) => {
  const totalDays = Math.max(1, Math.round((cycle.end.getTime() - cycle.start.getTime()) / ONE_DAY_IN_MS))
  const elapsedDays = Math.floor((nowMs - cycle.start.getTime()) / ONE_DAY_IN_MS) + 1

  return { totalDays, currentDay: Math.min(Math.max(elapsedDays, 1), totalDays) }
}

export interface DashboardMetricsContentProps {
  abiPct: number
  /** Distributed across every cycle to date. Not tied to the selected cycle. */
  paidAllTime: Big
  /** stRIF price, for the fiat equivalent of total backing. */
  strifPrice: number
  /**
   * The cycle these tiles describe. Follows the page's selection, so the labels have to say
   * which cycle they mean — "paid this cycle" is only true while that cycle is open.
   */
  cycle?: CycleHistoryEntry
  /** Active Builders right now. Applied only when the selected cycle is the running one. */
  buildersCount?: number | null
  /** Injected so stories and tests stay deterministic. */
  nowMs?: number
  isLoading?: boolean
  className?: string
}

export const DashboardMetricsContent = ({
  abiPct,
  paidAllTime,
  strifPrice,
  cycle,
  buildersCount = null,
  nowMs = Date.now(),
  isLoading = false,
  className,
}: DashboardMetricsContentProps) => {
  const isRunning = cycle?.status === 'running'
  const paidInCycle = cycle?.rewardsFiat ?? Big(0)
  const backing = cycle?.backing ?? 0n
  const backersCount = cycle?.backersCount ?? null
  // A Builder roster only exists for today, so it cannot describe a settled cycle.
  const cycleBuildersCount = isRunning ? buildersCount : null
  const progress = cycle && isRunning ? getCycleProgress(cycle, nowMs) : null

  const paidLabel = isRunning || !cycle ? 'Paid this cycle' : `Paid in cycle ${cycle.cycleNumber}`

  const participants =
    backersCount !== null || cycleBuildersCount !== null
      ? (backersCount ?? 0) + (cycleBuildersCount ?? 0)
      : null

  const participantsBreakdown = [
    backersCount !== null && `${backersCount} Backers`,
    cycleBuildersCount !== null && `${cycleBuildersCount} Builders`,
  ].filter(Boolean)

  return (
    <div
      className={cn('grid grid-cols-1 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)] gap-2', className)}
      data-testid="dashboard-metrics"
    >
      <AbiHeroCard
        abiPct={abiPct}
        paidInCycle={paidInCycle}
        paidInCycleLabel={paidLabel}
        paidAllTime={paidAllTime}
        isLoading={isLoading}
      />

      {/* The cycle tile carries the longest label ("Cycle 46 · Day 11 of 14"), so it gets the slack. */}
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.3fr)]">
        <MetricCard
          label="Total backing"
          value={millify(backing)}
          sub={
            <SubLabel>
              {STRIF} · {formatUsdCompact(Big(backing.toString()).mul(strifPrice))}
            </SubLabel>
          }
          data-testid="metric-total-backing"
        />

        <MetricCard
          label="Distributed all-time"
          value={formatUsdWhole(paidAllTime)}
          sub={
            <SubLabel className="text-success">
              +{formatUsdWhole(paidInCycle)} {isRunning ? 'this cycle' : 'that cycle'}
            </SubLabel>
          }
          data-testid="metric-distributed"
        />

        <MetricCard
          label="Participants"
          value={participants ?? '—'}
          sub={
            participantsBreakdown.length > 0 ? <SubLabel>{participantsBreakdown.join(' · ')}</SubLabel> : null
          }
          data-testid="metric-participants"
        />

        <MetricCard
          label={
            cycle
              ? progress
                ? `Cycle ${cycle.cycleNumber} · Day ${progress.currentDay} of ${progress.totalDays}`
                : `Cycle ${cycle.cycleNumber} · ${formatCycleWindow(cycle.start, cycle.end)}`
              : 'Current cycle'
          }
          value={formatUsdWhole(paidInCycle)}
          footer={
            // A settled cycle has no progress left to show; a bar frozen at 100% would be noise.
            progress ? (
              <ComparativeProgressBar
                className="mt-1"
                aria-label={`Day ${progress.currentDay} of ${progress.totalDays}`}
                values={[
                  { value: progress.currentDay, color: 'var(--color-v3-primary)' },
                  { value: progress.totalDays - progress.currentDay, color: SPLIT_COLORS.track },
                ]}
              />
            ) : null
          }
          data-testid="metric-cycle"
        />
      </div>
    </div>
  )
}

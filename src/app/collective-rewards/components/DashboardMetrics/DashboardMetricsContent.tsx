'use client'

import { ComparativeProgressBar } from '@/components/ComparativeProgressBar/ComparativeProgressBar'
import { Span } from '@/components/Typography'
import Big from '@/lib/big'
import { STRIF } from '@/lib/constants'
import { cn, millify } from '@/lib/utils'

import { ONE_DAY_IN_MS } from '../../constants/chartConstants'
import { CycleHistoryEntry } from '../../types'
import { formatUsdCompact, formatUsdWhole } from '../../utils/dashboardFormatters'
import { AbiHeroCard } from './AbiHeroCard'
import { MetricCard } from './MetricCard'

const SubLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
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
  /** Distributed across every cycle to date. */
  paidAllTime: Big
  /** stRIF price, for the fiat equivalent of total backing. */
  strifPrice: number
  /** The cycle currently open. Everything in this row describes it. */
  runningCycle?: CycleHistoryEntry
  /** Active Builders right now. */
  buildersCount?: number | null
  /** Injected so stories and tests stay deterministic. */
  nowMs?: number
  isLoading?: boolean
  className?: string
}

export const DashboardMetricsContent = ({
  runningCycle,
  abiPct,
  paidAllTime,
  buildersCount = null,
  strifPrice,
  nowMs = Date.now(),
  isLoading = false,
  className,
}: DashboardMetricsContentProps) => {
  const paidThisCycle = runningCycle?.rewardsFiat ?? Big(0)
  const backing = runningCycle?.backing ?? 0n
  const backersCount = runningCycle?.backersCount ?? null
  const progress = runningCycle ? getCycleProgress(runningCycle, nowMs) : null

  const participants =
    backersCount !== null || buildersCount !== null ? (backersCount ?? 0) + (buildersCount ?? 0) : null

  const participantsBreakdown = [
    backersCount !== null && `${backersCount} Backers`,
    buildersCount !== null && `${buildersCount} Builders`,
  ].filter(Boolean)

  return (
    <div
      className={cn('grid grid-cols-1 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)] gap-2', className)}
      data-testid="dashboard-metrics"
    >
      <AbiHeroCard
        abiPct={abiPct}
        paidThisCycle={paidThisCycle}
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
          sub={<SubLabel className="text-success">+{formatUsdWhole(paidThisCycle)} this cycle</SubLabel>}
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
            runningCycle && progress
              ? `Cycle ${runningCycle.cycleNumber} · Day ${progress.currentDay} of ${progress.totalDays}`
              : 'Current cycle'
          }
          value={formatUsdWhole(paidThisCycle)}
          footer={
            progress ? (
              <ComparativeProgressBar
                className="mt-1"
                aria-label={`Day ${progress.currentDay} of ${progress.totalDays}`}
                values={[
                  { value: progress.currentDay, color: 'var(--color-v3-primary)' },
                  { value: progress.totalDays - progress.currentDay, color: 'var(--color-v3-bg-accent-60)' },
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

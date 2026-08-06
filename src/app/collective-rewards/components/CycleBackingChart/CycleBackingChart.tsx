'use client'

import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header, Label, Span } from '@/components/Typography'
import { STRIF } from '@/lib/constants'
import { cn, millify } from '@/lib/utils'

import { BACKING_SERIES_COLOR } from '../../constants/dashboardColors'
import { CycleHistoryEntry } from '../../types'
import { formatCycleWindow } from '../../utils/dashboardFormatters'
import { CycleBackingTooltip } from './CycleBackingTooltip'

export type CycleChartRange = 'ten-cycles' | 'six-months' | 'all'

interface RangeOption {
  id: CycleChartRange
  label: string
  /** How many trailing cycles the range keeps. `null` keeps everything. */
  cycles: number | null
}

/** Roughly 13 cycles fit in six months at the current 14-day cadence. */
const RANGE_OPTIONS: RangeOption[] = [
  { id: 'ten-cycles', label: '10 cycles', cycles: 10 },
  { id: 'six-months', label: '6 months', cycles: 13 },
  { id: 'all', label: 'All', cycles: null },
]

const CHART_HEIGHT = 320
/** Above this many categories the axis labels collide, so we thin them out. */
const MAX_X_LABELS = 10
/** Room for the first tick label, which is centred on x=0 and would otherwise be clipped. */
const X_LABEL_GUTTER = 20

export interface CycleChartPoint {
  cycleNumber: number
  label: string
  backing: number
  start: Date
  end: Date
}

interface BackingDotProps {
  cx?: number
  cy?: number
  payload?: CycleChartPoint
}

/**
 * Marks the selected cycle permanently. Recharts' `activeDot` only appears on hover, which
 * left the chart with no indication of which cycle the panel beside it was describing.
 */
const backingDot = (selectedCycleNumber: number | undefined) => {
  const BackingDot = ({ cx, cy, payload }: BackingDotProps) => {
    const isSelected = payload?.cycleNumber === selectedCycleNumber

    return (
      <circle
        key={`dot-${payload?.cycleNumber}`}
        cx={cx}
        cy={cy}
        r={isSelected ? 5 : 3}
        fill={BACKING_SERIES_COLOR}
        stroke={isSelected ? 'var(--color-v3-bg-accent-80)' : 'none'}
        strokeWidth={isSelected ? 3 : 0}
      />
    )
  }
  BackingDot.displayName = 'BackingDot'

  return BackingDot
}

const RangeToggle = ({
  value,
  onChange,
}: {
  value: CycleChartRange
  onChange: (range: CycleChartRange) => void
}) => (
  <div className="flex items-center gap-1 shrink-0" role="group" aria-label="Chart range">
    {RANGE_OPTIONS.map(({ id, label }) => (
      <button
        key={id}
        type="button"
        onClick={() => onChange(id)}
        aria-pressed={value === id}
        className={cn(
          'px-3 py-1.5 rounded-full transition-colors cursor-pointer',
          value === id ? 'bg-v3-bg-accent-60' : 'hover:bg-v3-bg-accent-60/50',
        )}
      >
        <Label
          variant="tag-s"
          caps
          className={cn(
            'tracking-wider cursor-[inherit]',
            value === id ? 'text-v3-text-100' : 'text-v3-text-40',
          )}
        >
          {label}
        </Label>
      </button>
    ))}
  </div>
)

export interface CycleBackingChartProps {
  /** Cycle history in any order; the chart sorts ascending itself. */
  cycles: CycleHistoryEntry[]
  /** Cycle whose figures appear in the header and whose band is highlighted. */
  selectedCycle?: number | null
  onSelectCycle?: (cycleNumber: number) => void
  defaultRange?: CycleChartRange
  isLoading?: boolean
  className?: string
}

export const CycleBackingChart = ({
  cycles,
  selectedCycle = null,
  onSelectCycle,
  defaultRange = 'ten-cycles',
  isLoading = false,
  className,
}: CycleBackingChartProps) => {
  const [range, setRange] = useState<CycleChartRange>(defaultRange)

  const data = useMemo<CycleChartPoint[]>(() => {
    const ascending = [...cycles].sort((a, b) => a.cycleNumber - b.cycleNumber)
    const limit = RANGE_OPTIONS.find(({ id }) => id === range)?.cycles ?? null
    const windowed = limit === null ? ascending : ascending.slice(-limit)

    return windowed.map(({ cycleNumber, backing, start, end }) => ({
      cycleNumber,
      label: `C${cycleNumber}`,
      backing: Number(backing),
      start,
      end,
    }))
  }, [cycles, range])

  const xInterval = Math.max(0, Math.ceil(data.length / MAX_X_LABELS) - 1)

  // Falls back to the newest cycle so the header always has something to describe.
  const highlightedIndex = data.findIndex(({ cycleNumber }) => cycleNumber === selectedCycle)
  const resolvedIndex = highlightedIndex === -1 ? data.length - 1 : highlightedIndex
  const highlighted = data[resolvedIndex]
  /**
   * A band needs two distinct categories to have any width — passing the same label for both
   * edges renders nothing. Shading from the previous cycle covers the selected cycle's segment,
   * which is what the design shows.
   */
  const bandStart = data[resolvedIndex - 1]?.label ?? highlighted?.label

  return (
    <div
      className={cn('bg-v3-bg-accent-80 rounded-lg p-4 md:p-6 flex flex-col gap-4', className)}
      data-testid="cycle-backing-chart"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Label variant="tag-s" caps className="text-v3-text-40 tracking-wider">
            Total backing
          </Label>
          <div className="flex flex-wrap items-baseline gap-3">
            <Header variant="h1" className="text-v3-text-100">
              {highlighted ? `${millify(highlighted.backing)} ${STRIF}` : '—'}
            </Header>
            {highlighted && (
              <Span variant="body-s" className="text-v3-text-40">
                Cycle {highlighted.cycleNumber} · {formatCycleWindow(highlighted.start, highlighted.end)}
              </Span>
            )}
          </div>
        </div>

        <RangeToggle value={range} onChange={setRange} />
      </div>

      {isLoading && data.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: CHART_HEIGHT }}>
          <LoadingSpinner />
        </div>
      ) : (
        <div style={{ height: CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 0, bottom: 0, left: X_LABEL_GUTTER }}
              onClick={({ activeLabel }) => {
                const clicked = data.find(({ label }) => label === activeLabel)
                if (clicked) onSelectCycle?.(clicked.cycleNumber)
              }}
              className={onSelectCycle ? 'cursor-pointer' : undefined}
            >
              <defs>
                <linearGradient id="cycleBackingFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BACKING_SERIES_COLOR} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={BACKING_SERIES_COLOR} stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="var(--color-v3-bg-accent-60)" vertical={false} />

              <XAxis
                dataKey="label"
                axisLine={{ stroke: 'var(--color-v3-bg-accent-60)' }}
                tickLine={false}
                interval={xInterval}
                tickMargin={12}
                tick={{ fill: 'var(--color-v3-text-40)', fontSize: 12 }}
                className="font-rootstock-sans"
              />

              <YAxis
                orientation="right"
                // Recharts picks round ticks off the data max; a hand-rolled ceiling
                // overshot badly (28M of backing produced a 40M axis).
                domain={[0, 'auto']}
                tickCount={5}
                // Headroom in pixels rather than domain units, so the peak clears the top
                // edge without pushing the ticks off round numbers.
                padding={{ top: 20 }}
                // Wrapped because recharts passes the tick index as the second argument,
                // which millify would read as its separator.
                tickFormatter={value => millify(value)}
                axisLine={{ stroke: 'var(--color-v3-primary)' }}
                tickLine={false}
                width={52}
                tick={{ fill: 'var(--color-v3-text-40)', fontSize: 12 }}
                className="font-rootstock-sans"
              />

              {highlighted && bandStart !== highlighted.label && (
                <ReferenceArea
                  x1={bandStart}
                  x2={highlighted.label}
                  fill="var(--color-v3-text-100)"
                  fillOpacity={0.06}
                  ifOverflow="extendDomain"
                />
              )}

              <Area
                type="monotone"
                dataKey="backing"
                stroke={BACKING_SERIES_COLOR}
                strokeWidth={2}
                fill="url(#cycleBackingFill)"
                dot={backingDot(highlighted?.cycleNumber)}
                activeDot={{
                  r: 6,
                  fill: BACKING_SERIES_COLOR,
                  stroke: 'var(--color-v3-bg-accent-80)',
                  strokeWidth: 3,
                }}
              />

              <Tooltip
                content={<CycleBackingTooltip />}
                wrapperStyle={{ outline: 'none' }}
                cursor={{ stroke: 'var(--color-v3-text-40)', strokeDasharray: '4 4' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

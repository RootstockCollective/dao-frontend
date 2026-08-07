'use client'

import { useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { SegmentedControl } from '@/components/SegmentedControl'
import { Header, Label, Span } from '@/components/Typography'
import { STRIF } from '@/lib/constants'
import { cn } from '@/lib/utils'

import { BACKING_SERIES_COLOR } from '../../constants/dashboardColors'
import { CARD_RADIUS } from '../../constants/dashboardSurface'
import { CycleHistoryEntry } from '../../types'
import { formatBackingCompact, formatCycleWindow } from '../../utils/dashboardFormatters'
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

/**
 * Floor rather than a fixed height: the card stretches to match the distribution panel beside
 * it, and the plot takes whatever that leaves so the two never end on different lines.
 */
const CHART_MIN_HEIGHT = 220
/** Above this many categories the axis labels collide, so we thin them out. */
const MAX_X_LABELS = 10
/**
 * Room for the first and last tick labels, which are centred on the plot's edges and would
 * otherwise be clipped. Both sides need it now that the value axis is gone and no longer
 * reserves width on the right.
 */
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
  <SegmentedControl
    label="Chart range"
    className="shrink-0"
    value={value}
    onChange={onChange}
    options={RANGE_OPTIONS.map(({ id, label }) => ({ value: id, label }))}
    optionClassName="px-3 py-1.5 rounded-full hover:bg-v3-bg-accent-60/50"
    selectedOptionClassName="bg-v3-bg-accent-60"
    renderLabel={({ label }, isSelected) => (
      <Label
        variant="tag-s"
        caps
        className={cn('tracking-wider cursor-[inherit]', isSelected ? 'text-v3-text-100' : 'text-v3-text-40')}
      >
        {label}
      </Label>
    )}
  />
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

  return (
    <div
      className={cn('bg-v3-bg-accent-80 p-4 md:p-6 flex h-full flex-col gap-4', CARD_RADIUS, className)}
      data-testid="cycle-backing-chart"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Label variant="tag-s" caps className="text-v3-text-40 tracking-wider">
            Total backing
          </Label>
          <div className="flex flex-wrap items-baseline gap-3">
            <Header variant="h1" className="text-v3-text-100">
              {highlighted ? `${formatBackingCompact(highlighted.backing)} ${STRIF}` : '—'}
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
        <div className="flex flex-1 items-center justify-center" style={{ minHeight: CHART_MIN_HEIGHT }}>
          <LoadingSpinner />
        </div>
      ) : (
        // `min-h-0` so the plot can be sized by the row rather than by its own content, which
        // is what a flex child defaults to and would stop the container from ever shrinking.
        <div className="min-h-0 flex-1" style={{ minHeight: CHART_MIN_HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: X_LABEL_GUTTER, bottom: 0, left: X_LABEL_GUTTER }}
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

              {/*
                No gridlines and no visible value axis: the design reads this as a shape, not a
                measurement. Every figure the axis used to carry is still stated exactly — the
                selected cycle in the header above, any other cycle in the tooltip.
              */}
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                interval={xInterval}
                tickMargin={12}
                tick={{ fill: 'var(--color-v3-text-40)', fontSize: 12 }}
                className="font-rootstock-sans"
              />

              {/*
                Hidden rather than deleted. The scale still has to be declared: `hide` drops the
                line, ticks and reserved width but keeps the baseline pinned to zero, so the
                filled area continues to describe the real magnitude. Dropping the element
                entirely would hand the domain to recharts' defaults and silently change what
                the shape means.
              */}
              <YAxis
                hide
                // Recharts picks round ticks off the data max; a hand-rolled ceiling
                // overshot badly (28M of backing produced a 40M axis).
                domain={[0, 'auto']}
                // Headroom in pixels rather than domain units, so the peak clears the top edge.
                padding={{ top: 20 }}
              />

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

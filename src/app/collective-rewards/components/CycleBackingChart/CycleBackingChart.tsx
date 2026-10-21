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
  /** Trailing cycles kept; `null` keeps everything. */
  cycles: number | null
}

const RANGE_OPTIONS: RangeOption[] = [
  { id: 'ten-cycles', label: '10 cycles', cycles: 10 },
  // 13 cycles ≈ six months at the 14-day cadence.
  { id: 'six-months', label: '6 months', cycles: 13 },
  { id: 'all', label: 'All', cycles: null },
]

const CHART_MIN_HEIGHT = 220
const MAX_X_LABELS = 10
/** Keeps the first and last tick labels, centred on the plot's edges, from being clipped. */
const X_LABEL_GUTTER = 20

export interface CycleChartPoint {
  cycleNumber: number
  label: string
  /** `null` renders as a gap in the area, not a zero. */
  backing: number | null
  start: Date
  end: Date
}

interface BackingDotProps {
  cx?: number
  cy?: number
  payload?: CycleChartPoint
}

/** Marks the selected cycle permanently; recharts' `activeDot` only shows on hover. */
const backingDot = (selectedCycleNumber: number | undefined) => {
  const BackingDot = ({ cx, cy, payload }: BackingDotProps) => {
    if (payload?.backing === null || cx === undefined || cy === undefined) return null

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
  cycles: CycleHistoryEntry[]
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
  const [trackedSelection, setTrackedSelection] = useState<number | null>(null)

  const ascending = useMemo(() => [...cycles].sort((a, b) => a.cycleNumber - b.cycleNumber), [cycles])

  // A cycle selected from the table can fall outside the current range: widen to the narrowest
  // range that holds it. State adjusted during render, per React's "adjusting state on prop change".
  if (selectedCycle !== trackedSelection) {
    setTrackedSelection(selectedCycle)

    const selectedIndex = ascending.findIndex(({ cycleNumber }) => cycleNumber === selectedCycle)
    const cyclesNeeded = ascending.length - selectedIndex
    const rangeCycles = RANGE_OPTIONS.find(({ id }) => id === range)?.cycles ?? null

    if (selectedIndex !== -1 && rangeCycles !== null && cyclesNeeded > rangeCycles) {
      const widened = RANGE_OPTIONS.find(({ cycles: kept }) => kept === null || kept >= cyclesNeeded)
      if (widened) setRange(widened.id)
    }
  }

  const data = useMemo<CycleChartPoint[]>(() => {
    const limit = RANGE_OPTIONS.find(({ id }) => id === range)?.cycles ?? null
    const windowed = limit === null ? ascending : ascending.slice(-limit)

    return windowed.map(({ cycleNumber, backing, start, end }) => ({
      cycleNumber,
      label: `C${cycleNumber}`,
      backing: backing === null ? null : Number(backing),
      start,
      end,
    }))
  }, [ascending, range])

  const xInterval = Math.max(0, Math.ceil(data.length / MAX_X_LABELS) - 1)

  // From every cycle, not the visible ones, so narrowing the range never changes the header.
  const highlighted = ascending.find(({ cycleNumber }) => cycleNumber === selectedCycle) ?? ascending.at(-1)

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
              {highlighted?.backing != null ? `${formatBackingCompact(highlighted.backing)} ${STRIF}` : '—'}
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

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                interval={xInterval}
                tickMargin={12}
                tick={{ fill: 'var(--color-v3-text-40)', fontSize: 12 }}
                className="font-rootstock-sans"
              />

              {/* Hidden, not removed: it pins the baseline to zero, which recharts' default domain would not. */}
              <YAxis hide domain={[0, 'auto']} padding={{ top: 20 }} />

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

'use client'

import { type HTMLAttributes, useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { KotoQuestionMarkIcon } from '@/components/Icons/KotoQuestionMarkIcon'
import { TokenImage } from '@/components/TokenImage'
import { Tooltip } from '@/components/Tooltip'
import { Label, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'

import type { CapitalAllocationDisplay } from '../../services/ui/types'
import {
  CAPITAL_ALLOCATION_CHART_COLORS,
  DONUT_CHART_SIZE,
  DONUT_INNER_RADIUS_PERCENT,
  DONUT_OUTER_RADIUS_PERCENT,
} from './CapitalAllocationDonutChart.constants'
import { segmentsFromDisplay } from './CapitalAllocationDonutChart.utils'
import { CAPITAL_ALLOCATION_TOOLTIP_MAP } from './CapitalAllocationSection.constants'

export interface CapitalAllocationDonutChartProps extends HTMLAttributes<HTMLDivElement> {
  data: CapitalAllocationDisplay
  /** Disable animation (e.g. in tests for stable DOM). */
  isAnimationActive?: boolean
}

export function CapitalAllocationDonutChart({
  data,
  isAnimationActive = true,
  className,
  ...props
}: CapitalAllocationDonutChartProps) {
  const segments = useMemo(() => segmentsFromDisplay(data), [data])
  const total = useMemo(() => segments.reduce((s, seg) => s + seg.value, 0), [segments])

  return (
    <div
      className={cn('relative mx-auto w-full aspect-square', className)}
      style={{ maxWidth: DONUT_CHART_SIZE }}
      data-testid="capital-allocation-donut-chart"
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={segments}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={`${DONUT_INNER_RADIUS_PERCENT}%`}
            outerRadius={`${DONUT_OUTER_RADIUS_PERCENT}%`}
            paddingAngle={0}
            isAnimationActive={isAnimationActive}
            startAngle={90}
            endAngle={-270}
          >
            {segments.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CAPITAL_ALLOCATION_CHART_COLORS[index] ?? '#888'}
                stroke="none"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {total > 0 && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center">
          <ul
            className="flex w-max list-none flex-col items-start gap-6 p-0"
            data-testid="capital-allocation-legend"
            aria-label="Capital allocation legend"
          >
            {data.categories.map((cat, index) => (
              <li
                key={cat.label}
                className="flex min-w-0 flex-col items-start gap-0"
                data-testid={`legend-${cat.label.toLowerCase().replaceAll(/\s+/g, '-')}`}
              >
                {/* Row 1: dot + label — fixed min-height for consistent vertical alignment across items */}
                <span className="flex min-h-6 min-w-0 items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: CAPITAL_ALLOCATION_CHART_COLORS[index] ?? '#888' }}
                    aria-hidden
                  />
                  <Label variant="tag" className="shrink-0 font-normal" style={{ color: '#ACA39D' }}>
                    {cat.label}
                  </Label>
                  {CAPITAL_ALLOCATION_TOOLTIP_MAP[cat.label] && (
                    <Tooltip text={CAPITAL_ALLOCATION_TOOLTIP_MAP[cat.label]}>
                      <KotoQuestionMarkIcon
                        className="shrink-0 cursor-help"
                        aria-label={`Tooltip for ${cat.label}`}
                      />
                    </Tooltip>
                  )}
                </span>
                {/* Row 2: token amount + percentage — fixed min-height for alignment */}
                <span className="flex min-h-7 min-w-0 items-center gap-1 pl-4 text-100">
                  <Span variant="body-l" bold>
                    {cat.amountFormatted}
                  </Span>
                  <TokenImage symbol={RBTC} size={18} />
                  <Span variant="body-s">{RBTC}</Span>
                  <span className="inline-block h-1.5 w-0.5 shrink-0 rounded-full bg-bg-20" />
                  <Span variant="body-l" bold>
                    {cat.percentFormatted}
                  </Span>
                </span>
                {/* Row 3: USD line — fixed min-height for alignment */}
                <span className="flex min-h-5 min-w-0 items-center pl-4">
                  <Span variant="body-s" className="text-white/50">
                    {cat.fiatAmountFormatted}
                  </Span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

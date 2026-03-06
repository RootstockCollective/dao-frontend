'use client'

import { type HTMLAttributes, useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { CAPITAL_ALLOCATION_TOOLTIP_MAP } from '@/app/btc-vault/components/CapitalAllocationSection.constants'
import type { CapitalAllocationDisplay } from '@/app/btc-vault/services/ui/types'
import { KotoQuestionMarkIcon } from '@/components/Icons/KotoQuestionMarkIcon'
import { TokenImage } from '@/components/TokenImage'
import { Tooltip } from '@/components/Tooltip'
import { Label, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'

import {
  CAPITAL_ALLOCATION_CHART_COLORS,
  DONUT_CHART_SIZE,
  DONUT_INNER_RADIUS_PERCENT,
  DONUT_OUTER_RADIUS_PERCENT,
} from './CapitalAllocationDonutChart.constants'

export interface CapitalAllocationDonutChartProps extends HTMLAttributes<HTMLDivElement> {
  data: CapitalAllocationDisplay
  /** Disable animation (e.g. in tests for stable DOM). */
  isAnimationActive?: boolean
}

/** Parses "50%" -> 50. Returns 0 for invalid or missing input. */
function parsePercent(s: string): number {
  if (!s || typeof s !== 'string') return 0
  const match = s.trim().match(/^([\d.]+)\s*%?$/)
  if (!match) return 0
  const n = parseFloat(match[1])
  return Number.isFinite(n) ? n : 0
}

/** Builds segment values that sum to 100 from percentFormatted strings. Last segment gets remainder. */
function segmentsFromDisplay(data: CapitalAllocationDisplay): { name: string; value: number }[] {
  const raw = data.categories.map(cat => ({
    name: cat.label,
    value: parsePercent(cat.percentFormatted),
  }))
  const sum = raw.reduce((acc, s) => acc + s.value, 0)
  if (sum <= 0 || raw.length === 0) return raw.map(s => ({ ...s, value: 0 }))
  const result = raw.map(s => ({ name: s.name, value: s.value }))
  const exceptLast = result.slice(0, -1).reduce((a, x) => a + x.value, 0)
  result[result.length - 1].value = Math.max(0, 100 - exceptLast)
  return result
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
      className={cn('relative mx-auto', className)}
      style={{ width: DONUT_CHART_SIZE, height: DONUT_CHART_SIZE }}
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
        <ul
          className="pointer-events-auto absolute inset-0 flex list-none flex-col items-center justify-center gap-4 p-0"
          style={{ margin: '0 auto', width: '60%', top: 0, bottom: 0 }}
          data-testid="capital-allocation-legend"
          aria-label="Capital allocation legend"
        >
          {data.categories.map((cat, index) => (
            <li
              key={cat.label}
              className="flex flex-col gap-0.5"
              data-testid={`legend-${cat.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: CAPITAL_ALLOCATION_CHART_COLORS[index] ?? '#888' }}
                  aria-hidden
                />
                <Label variant="tag" className="text-100 font-normal">
                  {cat.label}
                </Label>
                {CAPITAL_ALLOCATION_TOOLTIP_MAP[cat.label] && (
                  <Tooltip text={CAPITAL_ALLOCATION_TOOLTIP_MAP[cat.label]}>
                    <KotoQuestionMarkIcon className="cursor-help" aria-label={`Tooltip for ${cat.label}`} />
                  </Tooltip>
                )}
              </span>
              <span className="flex items-center gap-1 pl-4 text-100">
                <Span variant="body-l" bold>
                  {cat.amountFormatted}
                </Span>
                <TokenImage symbol={RBTC} size={18} />
                <Span variant="body-s">{RBTC}</Span>
                <span className="text-white/40">|</span>
                <Span variant="body-l" bold>
                  {cat.percentFormatted}
                </Span>
              </span>
              <Span variant="body-s" className="pl-4 text-white/50">
                {cat.fiatAmountFormatted}
              </Span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

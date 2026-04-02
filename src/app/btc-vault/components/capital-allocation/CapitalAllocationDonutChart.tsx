'use client'

import { type CSSProperties, type HTMLAttributes, useMemo } from 'react'
import { Pie, PieChart, type PieSectorShapeProps, ResponsiveContainer, Sector } from 'recharts'

import { KotoQuestionMarkIcon } from '@/components/Icons/KotoQuestionMarkIcon'
import { TokenImage } from '@/components/TokenImage'
import { Tooltip } from '@/components/Tooltip'
import { Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'

import type { CapitalAllocationDisplay } from '../../services/ui/types'
import {
  CAPITAL_ALLOCATION_CHART_COLORS,
  DONUT_INNER_RADIUS_PERCENT,
  DONUT_LEGEND_MAX_WIDTH_RATIO,
  DONUT_OUTER_RADIUS_PERCENT,
} from './CapitalAllocationDonutChart.constants'
import { segmentsFromDisplay } from './CapitalAllocationDonutChart.utils'
import { CAPITAL_ALLOCATION_TOOLTIP_MAP } from './CapitalAllocationSection.constants'

function capitalAllocationPieSector(props: PieSectorShapeProps) {
  return <Sector {...props} stroke="none" />
}

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
  const segments = useMemo(() => {
    const base = segmentsFromDisplay(data)
    return base.map((s, i) => ({
      ...s,
      fill: CAPITAL_ALLOCATION_CHART_COLORS[i] ?? '#888',
    }))
  }, [data])
  const total = useMemo(() => segments.reduce((s, seg) => s + seg.value, 0), [segments])

  return (
    <div
      className={cn(
        'relative mx-auto aspect-square',
        /* Mobile: cancel SectionContainer px-4 (16+16); cap ~8px from viewport each side */
        'w-[calc(100%+2rem)] max-w-[min(calc(100%+2rem),calc(100vw-1rem))] -mx-4',
        /* md+: in-flow; 480px = DONUT_CHART_SIZE */
        'md:mx-auto md:w-full md:max-w-[480px]',
        className,
      )}
      data-testid="capital-allocation-donut-chart"
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={total > 0 ? segments : [{ name: 'empty', value: 1 }]}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={`${DONUT_INNER_RADIUS_PERCENT}%`}
            outerRadius={`${DONUT_OUTER_RADIUS_PERCENT}%`}
            paddingAngle={0}
            isAnimationActive={isAnimationActive}
            startAngle={90}
            endAngle={-270}
            shape={capitalAllocationPieSector}
          />
        </PieChart>
      </ResponsiveContainer>

      {total > 0 ? (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center p-1 md:p-0">
          <ul
            className={cn(
              'flex min-w-0 list-none flex-col gap-2 p-0',
              /* Mobile: centered block, width bound to inner hole */
              'w-full max-w-(--legend-cap) items-center',
              'md:w-max md:max-w-none md:items-start md:gap-6',
            )}
            style={{ ['--legend-cap']: `${DONUT_LEGEND_MAX_WIDTH_RATIO}%` } as CSSProperties}
            data-testid="capital-allocation-legend"
            aria-label="Capital allocation legend"
          >
            {data.categories.map((cat, index) => (
              <li
                key={cat.label}
                className="flex min-w-0 max-w-full flex-col items-center gap-0 text-center md:items-start md:text-left"
                data-testid={`legend-${cat.label.toLowerCase().replaceAll(/\s+/g, '-')}`}
              >
                <Span
                  variant="tag-s"
                  className="flex min-h-5 min-w-0 items-center justify-center gap-1 font-normal text-100 md:min-h-6 md:justify-start md:gap-1.5 md:text-base md:font-medium"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full md:h-2.5 md:w-2.5"
                    style={{ backgroundColor: CAPITAL_ALLOCATION_CHART_COLORS[index] ?? '#888' }}
                    aria-hidden
                  />
                  <span className="min-w-0 wrap-break-word">{cat.label}</span>
                  {CAPITAL_ALLOCATION_TOOLTIP_MAP[cat.label] && (
                    <Tooltip text={CAPITAL_ALLOCATION_TOOLTIP_MAP[cat.label]} side="top">
                      <KotoQuestionMarkIcon
                        size={14}
                        className="shrink-0 cursor-help"
                        aria-label={`Tooltip for ${cat.label}`}
                      />
                    </Tooltip>
                  )}
                </Span>
                <span className="flex min-h-6 min-w-0 flex-wrap items-center justify-center gap-1 text-100 md:min-h-7 md:justify-start md:pl-4">
                  <Span variant="body-s" bold className="md:text-lg">
                    {cat.amountFormatted}
                  </Span>
                  <TokenImage symbol={RBTC} size={14} className="md:h-[18px] md:w-[18px]" />
                  <Span variant="body-xs" className="md:text-sm">
                    {RBTC}
                  </Span>
                  <span className="inline-block h-1.5 w-0.5 shrink-0 rounded-full bg-bg-20" />
                  <Span variant="body-s" bold className="md:text-lg">
                    {cat.percentFormatted}
                  </Span>
                </span>
                <span className="flex min-h-4 min-w-0 items-center justify-center md:min-h-5 md:justify-start md:pl-4">
                  <Span variant="body-xs" className="text-white/50 md:text-sm">
                    {cat.fiatAmountFormatted}
                  </Span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Span variant="body-s" className="text-white/50" data-testid="capital-allocation-empty">
          No capital allocated yet
        </Span>
      )}
    </div>
  )
}

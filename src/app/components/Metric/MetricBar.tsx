import { Bar, BarDivider, BarProps, BarSegmentProps } from '@/components/Bar'
import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/lib/utils'
import Big from 'big.js'
import { Fragment, ReactElement, useMemo, useState } from 'react'
import { MetricBarSegment } from './MetricBarSegment'
import { MetricTooltipContent } from './MetricTooltipContent'
import { MetricToken } from './types'

export type MetricBarProps = BarProps & {
  segments: Array<MetricToken>
}

export const MetricBar = ({ segments, className, ...barProps }: MetricBarProps): ReactElement => {
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null)

  const positions: BarSegmentProps['position'][] = useMemo(
    () =>
      segments.map((_, index) => (index === 0 ? 'left' : index === segments.length - 1 ? 'right' : 'center')),
    [segments],
  )

  if (!segments.length) {
    return <></>
  }

  const totalFiatValue = segments.reduce((sum, { fiatValue }) => sum.add(fiatValue), Big(0))
  const allZero = totalFiatValue.eq(0)

  return (
    <Bar className={cn('h-1', className)} {...barProps}>
      {segments.map(({ symbol, fiatValue }, index) => {
        const isHovered = hoveredSymbol === symbol
        const fade = !allZero && !!hoveredSymbol && !isHovered
        const gray = allZero

        const flexBasis = allZero
          ? `${100 / segments.length}%`
          : `${Big(fiatValue).div(totalFiatValue).toNumber() * 100}%`

        return (
          <Fragment key={symbol}>
            <Tooltip
              side="top"
              disabled={allZero}
              text={
                <MetricTooltipContent
                  tokens={segments.map(segment => ({
                    ...segment,
                    fade: !allZero && !!hoveredSymbol && segment.symbol !== hoveredSymbol,
                  }))}
                />
              }
            >
              <MetricBarSegment
                position={positions[index]}
                symbol={symbol}
                fade={fade}
                gray={gray}
                onMouseEnter={() => setHoveredSymbol(symbol)}
                onMouseLeave={() => setHoveredSymbol(null)}
                style={{ flexBasis }}
              />
            </Tooltip>

            {index < segments.length - 1 && <BarDivider />}
          </Fragment>
        )
      })}
    </Bar>
  )
}

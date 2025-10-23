import { Bar, BarDivider, BarProps, BarSegmentProps } from '@/components/Bar'
import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/lib/utils'
import Big from 'big.js'
import { Fragment, ReactElement } from 'react'
import { MetricBarSegment } from './MetricBarSegment'
import { MetricTooltipContent } from './MetricTooltipContent'
import { MetricToken } from './types'

export type MetricBarProps = BarProps & {
  segments: Array<MetricToken>
}

export const MetricBar = ({ segments, className, ...barProps }: MetricBarProps): ReactElement => {
  if (!segments.length) {
    return <></>
  }

  const positions: BarSegmentProps['position'][] = segments.map((_, index) => {
    if (index === 0) return 'left'
    if (index === segments.length - 1) return 'right'

    return 'center'
  })

  const totalFiatValue = segments.reduce((sum, { fiatValue }) => sum.add(fiatValue), Big(0))

  if (totalFiatValue.eq(0)) {
    console.warn('MetricBar: totalFiatValue is zero, cannot render segments proportionally.')
  }

  return (
    <Bar className={cn('h-1', className)} {...barProps}>
      {segments.map(({ symbol, fiatValue }, index) => (
        <Fragment key={symbol}>
          <Tooltip
            side="top"
            text={
              <MetricTooltipContent
                tokens={segments.map(segment => ({
                  ...segment,
                  fade: segment.symbol !== symbol,
                }))}
              />
            }
          >
            <MetricBarSegment
              position={positions[index]}
              symbol={symbol}
              style={{
                flexBasis: `${
                  Big(fiatValue)
                    .div(totalFiatValue.eq(0) ? 1 : totalFiatValue)
                    .toNumber() * 100
                }%`,
              }}
            />
          </Tooltip>
          {index < segments.length - 1 && <BarDivider />}
        </Fragment>
      ))}
    </Bar>
  )
}

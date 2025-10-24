import { BarSegment, BarSegmentProps } from '@/components/Bar'
import { cn } from '@/lib/utils'
import { ReactElement } from 'react'
import { MetricToken, TokenSymbol } from './types'

export type MetricBarSegmentProps = BarSegmentProps &
  Pick<MetricToken, 'symbol'> & {
    fade?: boolean
    gray?: boolean
  }

const RIF_CLASSES = 'bg-v3-rif-blue border-v3-rif-blue'
const USDRIF_CLASSES = RIF_CLASSES
const RBTC_CLASSES = 'bg-v3-primary border-v3-primary'

const TOKEN_CLASSES: Record<TokenSymbol, string> = {
  RIF: RIF_CLASSES,
  USDRIF: USDRIF_CLASSES,
  rBTC: RBTC_CLASSES,
  tRBTC: RBTC_CLASSES,
}

export const MetricBarSegment = ({
  className,
  symbol,
  fade,
  gray,
  ...barProps
}: MetricBarSegmentProps): ReactElement => {
  return (
    <BarSegment
      className={cn(
        TOKEN_CLASSES[symbol],
        gray && 'bg-v3-bg-accent-20 border-v3-bg-accent-20',
        fade && 'opacity-40 transition-opacity duration-200',
        className,
      )}
      {...barProps}
    />
  )
}

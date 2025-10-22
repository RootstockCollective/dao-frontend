import { BarSegment, BarSegmentProps } from '@/components/Bar'
import { cn } from '@/lib/utils'
import { ReactElement } from 'react'
import { MetricToken, TokenSymbol } from './types'

export type MetricBarSegmentProps = BarSegmentProps & Pick<MetricToken, 'symbol'>

const RIF_CLASSES = 'bg-v3-rif-blue border-v3-rif-blue '
const USDRIF_CLASSES = RIF_CLASSES
const RBTC_CLASSES = 'bg-v3-primary border-v3-primary'

const TOKEN_CLASSES: Record<TokenSymbol, string> = {
  RIF: RIF_CLASSES,
  USDRIF: USDRIF_CLASSES,
  rBTC: RBTC_CLASSES,
  tRBTC: RBTC_CLASSES,
}

export const MetricBarSegment = ({ className, symbol, ...barProps }: MetricBarSegmentProps): ReactElement => {
  return <BarSegment className={cn(TOKEN_CLASSES[symbol], className)} {...barProps} />
}

import { BarSegment, BarSegmentProps } from '@/components/Bar'
import { cn } from '@/lib/utils'
import { ReactElement } from 'react'
import { TokenSymbol } from './types'

export type MetricBarSegmentProps = BarSegmentProps & {
  token: TokenSymbol
}

const RIF_CLASSES = 'bg-v3-rif-blue border-v3-rif-blue '
const USDRIF_CLASSES = RIF_CLASSES
const RBTC_CLASSES = 'bg-v3-primary border-v3-primary'

const TOKEN_CLASSES: Record<MetricBarSegmentProps['token'], string> = {
  RIF: RIF_CLASSES,
  USDRIF: USDRIF_CLASSES,
  rBTC: RBTC_CLASSES,
  tRBTC: RBTC_CLASSES,
}

export const MetricBarSegment = ({ className, token, ...barProps }: MetricBarSegmentProps): ReactElement => {
  return <BarSegment className={cn(TOKEN_CLASSES[token], className)} {...barProps} />
}

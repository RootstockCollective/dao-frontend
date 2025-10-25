import { Paragraph } from '@/components/Typography'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards/utils'
import { RBTC, RIF, USDRIF } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'
import { ReactNode } from 'react'
import { MetricToken } from '@/app/components/Metric/types'
import { FiatTooltipLabel } from '@/app/components/Tooltip/FiatTooltipLabel/FiatTooltipLabel'

export interface RewardsCellProps {
  usdValue: number
  rbtcValue: bigint
  rifValue: bigint
  usdrifValue: bigint
  rifPrice: number
  rbtcPrice: number
  usdrifPrice: number
  emptyPlaceholder?: ReactNode
  className?: string
}

export const RewardsCell = ({
  usdValue,
  rbtcValue,
  rifValue,
  usdrifValue,
  rifPrice,
  rbtcPrice,
  usdrifPrice,
  className = '',
  emptyPlaceholder = null,
}: RewardsCellProps): ReactNode => {
  if (usdValue === 0) {
    return emptyPlaceholder
  }

  const tokens: Array<MetricToken> = [
    {
      symbol: RIF,
      value: formatSymbol(rifValue, RIF),
      fiatValue: getFiatAmount(rifValue, rifPrice).toFixed(2),
    },
    {
      symbol: RBTC,
      value: formatSymbol(rbtcValue, RBTC),
      fiatValue: getFiatAmount(rbtcValue, rbtcPrice).toFixed(2),
    },
    {
      symbol: USDRIF,
      value: formatSymbol(usdrifValue, USDRIF),
      fiatValue: getFiatAmount(usdrifValue, usdrifPrice).toFixed(2),
    },
  ]

  return (
    <div className={cn('flex flex-row items-baseline justify-center gap-1 font-rootstock-sans', className)}>
      <Paragraph>{formatCurrency(usdValue)}</Paragraph>
      <FiatTooltipLabel tooltip={{ text: <MetricTooltipContent tokens={tokens} />, side: 'top' }} />
    </div>
  )
}

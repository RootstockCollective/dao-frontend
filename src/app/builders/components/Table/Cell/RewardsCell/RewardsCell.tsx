import { DottedUnderlineLabel } from '@/components/DottedUnderlineLabel/DottedUnderlineLabel'
import { Paragraph } from '@/components/Typography'
import { Tooltip } from '@/components/Tooltip'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards/utils'
import { RBTC, RIF, USDRIF } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'
import { ReactNode } from 'react'
import { MetricToken } from '@/app/components/Metric/types'

export interface RewardsCellProps {
  usdValue: number
  rbtcValue: bigint
  rifValue: bigint
  usdrifValue: bigint
  rifPrice: number
  rbtcPrice: number
  usdrifPrice?: number
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
  usdrifPrice = 1,
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
      fiatValue: formatCurrency(getFiatAmount(rifValue, rifPrice)),
    },
    {
      symbol: RBTC,
      value: formatSymbol(rbtcValue, RBTC),
      fiatValue: formatCurrency(getFiatAmount(rbtcValue, rbtcPrice)),
    },
    {
      symbol: USDRIF,
      value: formatSymbol(usdrifValue, USDRIF),
      fiatValue: formatCurrency(getFiatAmount(usdrifValue, usdrifPrice)),
    },
  ]

  return (
    <div className={cn('flex flex-row items-baseline justify-center gap-1 font-rootstock-sans', className)}>
      <Paragraph>{formatCurrency(usdValue)}</Paragraph>
      <Tooltip side="top" text={<MetricTooltipContent tokens={tokens} />}>
        <span className="cursor-pointer">
          <DottedUnderlineLabel>USD</DottedUnderlineLabel>
        </span>
      </Tooltip>
    </div>
  )
}

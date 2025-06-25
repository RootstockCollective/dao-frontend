import { ReactNode } from 'react'
import { Typography } from '@/components/TypographyNew/Typography'
import { TokenImage } from '@/components/TokenImage'
import { RBTC, RIF } from '@/lib/constants'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils/formatter'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { cn } from '@/lib/utils'

interface RifRbtcTooltipProps {
  children: ReactNode
  totalEstimatedRbtc: bigint
  totalEstimatedRif: bigint
  className?: string
}
const TokenSymbol = ({ symbol }: { symbol: string }) => {
  return (
    <div className="flex items-start gap-1">
      <TokenImage symbol={symbol} size={16} />
      <Typography>{symbol}</Typography>
    </div>
  )
}

const TokenAmount = ({ amount, symbol }: { amount: bigint; symbol: string }) => {
  return <Typography>{formatSymbol(amount, symbol)}</Typography>
}

export const RifRbtcTooltip = ({
  children,
  totalEstimatedRbtc,
  totalEstimatedRif,
  className,
}: RifRbtcTooltipProps) => (
  <Tooltip
    side="top"
    align="center"
    className={cn('bg-white rounded-[4px] shadow-lg p-0 cursor-pointer', className)}
    text={
      <div className="flex items-start text-2xl font-medium rounded p-4 bg-v3-text-80 text-v3-text-0">
        <div className="flex flex-col gap-2 mr-2">
          <TokenAmount amount={totalEstimatedRbtc} symbol="rbtc" />
          <TokenAmount amount={totalEstimatedRif} symbol="stRIF" />
        </div>
        <div className="flex flex-col gap-2">
          <TokenSymbol symbol={RBTC} />
          <TokenSymbol symbol={RIF} />
        </div>
      </div>
    }
  >
    <span>{children}</span>
  </Tooltip>
)

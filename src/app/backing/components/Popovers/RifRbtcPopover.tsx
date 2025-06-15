import { ReactNode } from 'react'
import { Popover } from '@/components/Popover'
import { Typography } from '@/components/TypographyNew/Typography'
import { TokenImage } from '@/components/TokenImage'
import { RBTC, RIF } from '@/lib/constants'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils/formatter'

interface RifRbtcPopoverProps {
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

export const RifRbtcPopover = ({
  children,
  totalEstimatedRbtc,
  totalEstimatedRif,
  className,
}: RifRbtcPopoverProps) => (
  <Popover
    trigger="hover"
    position="left"
    background="light"
    content={
      <div
        className={`rounded p-4 bg-v3-text-80 text-v3-text-0 ${className ?? ''}`}
        data-testid="rifRbtcPopover"
      >
        <div className="flex items-start text-2xl font-medium">
          <div className="flex flex-col gap-2 mr-2">
            <TokenAmount amount={totalEstimatedRbtc} symbol="rbtc" />
            <TokenAmount amount={totalEstimatedRif} symbol="stRIF" />
          </div>
          <div className="flex flex-col gap-2">
            <TokenSymbol symbol={'rBTC'} />
            <TokenSymbol symbol={RIF} />
          </div>
        </div>
      </div>
    }
    contentSubContainerClassName="border-none shadow-none p-0"
    contentContainerClassName="w-52"
  >
    <div className="w-full flex flex-col items-start">{children}</div>
  </Popover>
)

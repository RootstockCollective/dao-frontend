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
            <Typography>{formatSymbol(totalEstimatedRbtc, 'rbtc')}</Typography>
            <Typography>{formatSymbol(totalEstimatedRif, 'stRIF')}</Typography>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-1">
              <TokenImage symbol={RBTC} size={18} />
              <Typography>rBTC</Typography>
            </div>
            <div className="flex items-start gap-1">
              <TokenImage symbol={RIF} size={16} />
              <Typography>RIF</Typography>
            </div>
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

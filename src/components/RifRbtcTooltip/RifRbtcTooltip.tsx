import { ReactNode } from 'react'
import { Typography } from '@/components/TypographyNew/Typography'
import { TokenImage } from '@/components/TokenImage'
import { RBTC, RIF } from '@/lib/constants'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils/formatter'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { cn } from '@/lib/utils'
import { CommonComponentProps } from '@/components/commonProps'

interface RifRbtcTooltipProps extends CommonComponentProps {
  rbtcValue: bigint
  rifValue: bigint
}

const RowContainer = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-row gap-2 items-center justify-between w-full">{children}</div>
}

export const RifRbtcTooltip = ({ children, rbtcValue, rifValue, className }: RifRbtcTooltipProps) => (
  <Tooltip
    side="top"
    align="center"
    className={cn('bg-white rounded-[4px] shadow-lg p-0 cursor-pointer', className)}
    text={
      <div className="flex flex-col items-center rounded p-4 bg-v3-text-80 text-v3-text-0">
        <RowContainer>
          <Typography className="text-lg">{formatSymbol(rbtcValue, RBTC)}</Typography>
          <div className="flex flex-row items-start gap-[2px] w-14">
            <TokenImage symbol={RBTC} size={21} />
            <Typography className="text-sm">rBTC</Typography>
          </div>
        </RowContainer>
        <RowContainer>
          <Typography className="text-lg">{formatSymbol(rifValue, RIF)}</Typography>
          <div className="flex flex-row items-start gap-1 w-14">
            <TokenImage symbol={RIF} size={16} className="mx-[1.3px]" />
            <Typography className="text-sm">RIF</Typography>
          </div>
        </RowContainer>
      </div>
    }
  >
    <span>{children}</span>
  </Tooltip>
)

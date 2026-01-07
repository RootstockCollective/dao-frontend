import { formatSymbol } from '@/app/shared/formatter'
import { CommonComponentProps } from '@/components/commonProps'
import { TokenImage } from '@/components/TokenImage'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { BaseTypography } from '@/components/Typography/Typography'
import { RBTC, RIF } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface RifRbtcTooltipProps extends CommonComponentProps {
  rbtcValue: bigint
  rifValue: bigint
}

const RowContainer = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-row gap-2 items-center justify-between w-full">{children}</div>
}

const TokenDisplay = ({
  symbol,
  size,
  displayText,
  className,
}: {
  symbol: string
  size: number
  displayText: string
  className?: string
}) => {
  return (
    <div className="flex flex-row items-start w-14">
      <TokenImage symbol={symbol} size={size} className={className} />
      <BaseTypography className="text-sm">{displayText}</BaseTypography>
    </div>
  )
}

const FormattedValue = ({ value, symbol }: { value: bigint; symbol: string }) => {
  return <BaseTypography className="text-lg">{formatSymbol(value, symbol)}</BaseTypography>
}

export const RifRbtcTooltip = ({ children, rbtcValue, rifValue, className }: RifRbtcTooltipProps) => (
  <Tooltip
    side="top"
    align="center"
    className={cn('bg-v3-text-80 rounded-[4px] shadow-lg p-0 cursor-pointer z-50', className)}
    text={
      <div className="flex flex-col items-center rounded p-4 bg-v3-text-80 text-v3-text-0">
        <RowContainer>
          <FormattedValue value={rbtcValue} symbol={RBTC} />
          <TokenDisplay symbol={RBTC} size={21} displayText="rBTC" />
        </RowContainer>
        <RowContainer>
          <FormattedValue value={rifValue} symbol={RIF} />
          <TokenDisplay symbol={RIF} size={16} displayText="RIF" className="ml-[1.3px] mr-[3.7px]" />
        </RowContainer>
      </div>
    }
  >
    <span>{children}</span>
  </Tooltip>
)

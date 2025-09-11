import { DottedUnderlineLabel } from '@/components/DottedUnderlineLabel/DottedUnderlineLabel'
import { RifRbtcTooltip } from '@/components/RifRbtcTooltip/RifRbtcTooltip'
import { Paragraph } from '@/components/Typography'
import { cn, formatCurrency } from '@/lib/utils'
import { ReactNode } from 'react'

export interface RewardsCellProps {
  usdValue: number
  rbtcValue: bigint
  rifValue: bigint
  emptyPlaceholder?: ReactNode
  className?: string
}

export const RewardsCell = ({
  usdValue,
  rbtcValue,
  rifValue,
  className = '',
  emptyPlaceholder = null,
}: RewardsCellProps): ReactNode => {
  if (usdValue === 0) {
    return emptyPlaceholder
  }

  return (
    <div className={cn('flex flex-row items-baseline justify-center gap-1 font-rootstock-sans', className)}>
      <Paragraph>{formatCurrency(usdValue)}</Paragraph>
      <RifRbtcTooltip rbtcValue={rbtcValue} rifValue={rifValue}>
        <DottedUnderlineLabel>USD</DottedUnderlineLabel>
      </RifRbtcTooltip>
    </div>
  )
}

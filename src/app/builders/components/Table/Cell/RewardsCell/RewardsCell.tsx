import { DottedUnderlineLabel } from '@/components/DottedUnderlineLabel/DottedUnderlineLabel'
import { RifRbtcTooltip } from '@/components/RifRbtcTooltip/RifRbtcTooltip'
import { Paragraph } from '@/components/TypographyNew'
import { cn, formatCurrency } from '@/lib/utils'
import React from 'react'

export interface RewardsCellProps {
  usdValue: number
  rbtcValue: bigint
  rifValue: bigint
  className?: string
}

export const RewardsCell: React.FC<RewardsCellProps> = ({
  usdValue,
  rbtcValue,
  rifValue,
  className = '',
}) => {
  return (
    <div className={cn('flex flex-row items-baseline justify-center gap-1 font-rootstock-sans', className)}>
      <Paragraph>{formatCurrency(usdValue)}</Paragraph>
      <RifRbtcTooltip rbtcValue={rbtcValue} rifValue={rifValue}>
        <DottedUnderlineLabel>USD</DottedUnderlineLabel>
      </RifRbtcTooltip>
    </div>
  )
}

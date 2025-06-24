import React from 'react'
import { Paragraph } from '@/components/TypographyNew'
import { DottedUnderlineLabel } from '@/app/backing/components/DottedUnderlineLabel/DottedUnderlineLabel'
import { RifRbtcTooltip } from '@/app/backing/components/Popovers/RifRbtcTooltip'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface RewardsCellProps {
  totalEstimatedUsd: number
  totalEstimatedRbtc: bigint
  totalEstimatedRif: bigint
  className?: string
}

export const RewardsCell: React.FC<RewardsCellProps> = ({
  totalEstimatedUsd,
  totalEstimatedRbtc,
  totalEstimatedRif,
  className = '',
}) => {
  return (
    <div className={cn('flex flex-row items-baseline justify-center gap-1 font-rootstock-sans', className)}>
      <Paragraph>{formatCurrency(totalEstimatedUsd)}</Paragraph>
      <RifRbtcTooltip totalEstimatedRbtc={totalEstimatedRbtc} totalEstimatedRif={totalEstimatedRif}>
        <span>
          <DottedUnderlineLabel>USD</DottedUnderlineLabel>
        </span>
      </RifRbtcTooltip>
    </div>
  )
}

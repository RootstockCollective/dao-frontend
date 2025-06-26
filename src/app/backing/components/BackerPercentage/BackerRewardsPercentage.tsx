import { DeltaIndicator } from '../../../../components/DeltaIndicator/DeltaIndicator'
import { cn } from '@/lib/utils'
import { FC } from 'react'

interface BackerRewardsPercentageProps {
  className?: string
  currentPct: number
  nextPct?: number
}

export const BackerRewardsPercentage: FC<BackerRewardsPercentageProps> = ({
  className,
  currentPct,
  nextPct,
}) => {
  return (
    <div
      className={cn('flex flex-row gap-x-1 font-rootstock-sans justify-start font-normal', className)}
      data-testid="backerPercentageContainer"
    >
      <div data-testid="backerPercentageCurrent">{currentPct}%</div>
      <DeltaIndicator currentPct={currentPct} nextPct={nextPct} data-testid="backerPercentageDelta" />
    </div>
  )
}

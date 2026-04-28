import { cn } from '@/lib/utils'

import { DeltaIndicator } from '../../../../components/DeltaIndicator/DeltaIndicator'

interface BackerRewardsPercentageProps {
  currentPct: number
  className?: string
  nextPct?: number
}

export const BackerRewardsPercentage = ({ className, currentPct, nextPct }: BackerRewardsPercentageProps) => {
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

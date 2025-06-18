import { BackerRewardPercentage } from '@/app/collective-rewards/rewards/types'
import { weiToPercentage } from '@/app/collective-rewards/settings'
import { DeltaIndicator } from '@/components/DeltaIndicator/DeltaIndicator'
import { cn } from '@/lib/utils'
import { FC } from 'react'

export interface BackersPercentageCellProps {
  percentage: BackerRewardPercentage
  className?: string
}

export const BackersPercentageCell: FC<BackersPercentageCellProps> = ({ className, percentage }) => {
  const currentPct = weiToPercentage(percentage.current, 0)
  const nextPct = weiToPercentage(percentage.next, 0)
  return (
    <div className={cn('border-b-0', className)}>
      <div className="flex flex-row gap-x-1 font-rootstock-sans justify-center gap-1 ">
        {percentage && <div>{currentPct}</div>}
        <DeltaIndicator currentPct={Number(currentPct)} nextPct={Number(nextPct)} />
      </div>
    </div>
  )
}

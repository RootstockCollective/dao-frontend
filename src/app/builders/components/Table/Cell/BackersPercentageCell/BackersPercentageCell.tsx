import { BackerRewardPercentage } from '@/app/collective-rewards/types'
import { weiToPercentage } from '@/app/collective-rewards/settings'
import { DeltaIndicator } from '@/components/DeltaIndicator/DeltaIndicator'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import { StylableComponentProps } from '@/components/commonProps'

export interface BackersPercentageProps extends StylableComponentProps<HTMLDivElement> {
  percentage?: BackerRewardPercentage
}

export const BackersPercentage = ({ percentage, className }: BackersPercentageProps) => {
  const currentPct = weiToPercentage(percentage?.current ?? 0n, 0)
  const nextPct = weiToPercentage(percentage?.next ?? 0n, 0)
  return (
    <div
      className={cn(
        'flex flex-row gap-x-1 font-rootstock-sans self-center items-center justify-around gap-1',
        className,
      )}
    >
      {percentage && <div>{currentPct}</div>}
      <DeltaIndicator currentPct={Number(currentPct)} nextPct={Number(nextPct)} />
    </div>
  )
}

export const BackersPercentageCell: FC<BackersPercentageProps> = ({ className, percentage }) => {
  return (
    <div className={cn('border-b-0', className)}>
      <BackersPercentage percentage={percentage} />
    </div>
  )
}

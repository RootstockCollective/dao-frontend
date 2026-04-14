import { weiToPercentage } from '@/app/collective-rewards/settings'
import { BackerRewardPercentage } from '@/app/collective-rewards/types'
import { StylableComponentProps } from '@/components/commonProps'
import { DeltaIndicator } from '@/components/DeltaIndicator/DeltaIndicator'
import { cn } from '@/lib/utils'

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

export const BackersPercentageCell = ({ className, percentage }: BackersPercentageProps) => {
  return (
    <div className={cn('border-b-0', className)}>
      <BackersPercentage percentage={percentage} />
    </div>
  )
}

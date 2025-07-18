import { ArrowDownIcon, ArrowUpIcon } from '@/components/Icons'
import SeparatorBar from '@/components/SeparatorBar/SeparatorBar'
import { cn } from '@/lib/utils'
import { FC } from 'react'

interface DeltaIndicatorProps {
  currentPct: number
  nextPct?: number
}

const deltaMap = {
  increase: {
    Icon: ArrowUpIcon,
    colorClass: 'text-v3-success',
  },
  decrease: {
    Icon: ArrowDownIcon,
    colorClass: 'text-v3-error',
  },
}

export const DeltaIndicator: FC<DeltaIndicatorProps> = ({ currentPct, nextPct }) => {
  if (currentPct === undefined || nextPct === undefined) return null
  if (currentPct === nextPct) return null

  const deltaPercentage = nextPct - currentPct

  if (deltaPercentage === 0) return null

  const isIncrease = deltaPercentage > 0
  const deltaType = isIncrease ? 'increase' : 'decrease'
  const { Icon, colorClass } = deltaMap[deltaType]
  const displayValue = Math.abs(deltaPercentage)

  return (
    <div className={cn('flex flex-row items-center', colorClass)}>
      <SeparatorBar className="ml-2 mr-1" />
      <Icon />
      <div>{displayValue}</div>
    </div>
  )
}

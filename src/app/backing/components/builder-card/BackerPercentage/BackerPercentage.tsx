import { ArrowDownIcon } from '@/components/Icons/ArrowDownIcon'
import { ArrowUpIcon } from '@/components/Icons/ArrowUpIcon'
import { cn } from '@/lib/utils'
import { FC, useMemo } from 'react'

interface BackerRewardsPercentageProps {
  className?: string
  currentPct: number
  nextPct?: number
}

const deltaMap = {
  increase: {
    Icon: ArrowUpIcon,
    colorClass: 'text-v3-success',
    testId: 'backerPercentageIncrease',
    valueTestId: 'backerPercentageIncreaseValue',
  },
  decrease: {
    Icon: ArrowDownIcon,
    colorClass: 'text-v3-error',
    testId: 'backerPercentageDecrease',
    valueTestId: 'backerPercentageDecreaseValue',
  },
}

export const BackerRewardsPercentage: FC<BackerRewardsPercentageProps> = ({
  className,
  currentPct,
  nextPct,
}) => {
  const renderDelta = useMemo(() => {
    // if the values are undefined, we don't show the difference, but we show the difference if one of them is 0
    if (currentPct === undefined || nextPct === undefined) return null
    if (currentPct === nextPct) return null
    const deltaPercentage = nextPct - currentPct

    if (deltaPercentage === 0) {
      return null
    }

    const isIncrease = deltaPercentage > 0
    const deltaType = isIncrease ? 'increase' : 'decrease'
    const { Icon, colorClass, testId, valueTestId } = deltaMap[deltaType]
    const value = isIncrease ? deltaPercentage : Math.abs(deltaPercentage)

    return (
      <div className={`flex flex-row items-center ${colorClass}`} data-testid={testId}>
        <Icon className="flex-shrink-0 cursor-pointer" size={16} />
        <div data-testid={valueTestId}>{value}</div>
      </div>
    )
  }, [currentPct, nextPct])
  return (
    <div
      className={cn('flex flex-row gap-x-1 font-rootstock-sans justify-start gap-2 font-normal', className)}
      data-testid="backerPercentageContainer"
    >
      <div data-testid="backerPercentageCurrent">{currentPct}%</div>
      {renderDelta}
    </div>
  )
}

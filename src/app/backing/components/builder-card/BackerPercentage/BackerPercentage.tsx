import { FC, useMemo } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { ArrowUpIcon } from '@/components/Icons/ArrowUpIcon'
import { ArrowDownIcon } from '@/components/Icons/ArrowDownIcon'

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
  const renderDelta = useMemo(() => {
    if (!currentPct || !nextPct) return null
    if (currentPct === nextPct) return null
    const deltaPercentage = nextPct - currentPct

    if (deltaPercentage > 0) {
      return (
        <div className="flex flex-row items-center text-[#1bc47d]" data-testid="backerPercentageIncrease">
          <ArrowUpIcon className="flex-shrink-0 cursor-pointer" size={16} />
          <div data-testid="backerPercentageIncreaseValue">{deltaPercentage}</div>
        </div>
      )
    } else if (deltaPercentage < 0) {
      return (
        <div className="flex flex-row items-center text-[#f14722]" data-testid="backerPercentageDecrease">
          <ArrowDownIcon className="flex-shrink-0 cursor-pointer" size={16} />
          <div data-testid="backerPercentageDecreaseValue">{Math.abs(deltaPercentage)}</div>
        </div>
      )
    }
    return null
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

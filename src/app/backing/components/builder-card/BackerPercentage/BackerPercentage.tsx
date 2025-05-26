import { FC, useMemo } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

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
        <div className="flex flex-row items-center">
          <Image src="/images/arrow-up.svg" width={16} height={16} alt="Arrow Up" />
          <div className="text-[#1bc47d]">{deltaPercentage}</div>
        </div>
      )
    } else if (deltaPercentage < 0) {
      return (
        <div className="flex flex-row items-center">
          <Image src="/images/arrow-down.svg" width={16} height={16} alt="Arrow Down" />
          <div className="text-[#f14722]">{Math.abs(deltaPercentage)}</div>
        </div>
      )
    }
    return null
  }, [currentPct, nextPct])
  return (
    <div
      className={cn('flex flex-row gap-x-1 font-rootstock-sans justify-start gap-2 font-normal', className)}
    >
      <div>{currentPct}%</div>
      {renderDelta}
    </div>
  )
}

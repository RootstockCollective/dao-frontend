'use client'

import moment from 'moment'
import { useBlockNumber } from 'wagmi'

import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { useBlockTime } from '@/shared/context/BlockTimeContext'
import Big from '@/lib/big'

import { CountdownProps, TimeSource } from './types'

/**
 * Calculates the time remaining in seconds
 */
const calculateTimeRemaining = (
  end: Big,
  currentTime: Big,
  timeSource: TimeSource,
  secondsPerBlock: number,
): number => {
  const remaining = end.minus(currentTime)
  if (remaining.lte(0)) return 0

  if (timeSource === 'blocks') {
    return remaining.mul(secondsPerBlock).toNumber()
  } else {
    return remaining.toNumber()
  }
}

/**
 * Calculates the ratio for color coding (0 = no time left, 1 = full time remaining)
 * Returns null if ratio cannot be calculated
 */
const calculateRatio = (end: Big, currentTime: Big, referenceStart?: Big): number | null => {
  const remaining = end.minus(currentTime)
  if (remaining.lte(0)) return 0

  // If no reference start provided, we can't calculate a meaningful ratio
  if (!referenceStart) return null

  const totalPeriod = end.minus(referenceStart)
  if (totalPeriod.lte(0)) return null

  return Math.min(remaining.div(totalPeriod).toNumber(), 1)
}

/**
 * Converts seconds to human-readable format (e.g., "2d 5h 30m")
 */
const formatTimeRemaining = (seconds: number): string => {
  const duration = moment.duration(seconds, 'seconds')
  const days = duration.days()
  const hours = duration.hours()
  const minutes = duration.minutes()

  return `${days}d ${hours}h ${minutes}m`
}

/**
 * Determines the text color class based on the ratio and color direction
 */
const getColorClass = (ratio: number, colorDirection: 'normal' | 'reversed' = 'normal'): string => {
  if (colorDirection === 'reversed') {
    // Reversed: red (lots of time) → yellow → green (little time)
    if (ratio > 0.66) {
      return 'text-st-error' // Red - lots of time remaining
    } else if (ratio > 0.33 && ratio <= 0.66) {
      return 'text-st-info' // Yellow - moderate time remaining
    } else {
      return 'text-st-success' // Green - little time remaining
    }
  } else {
    // Normal: green (lots of time) → yellow → red (little time)
    if (ratio > 0.66) {
      return 'text-st-success' // Green - lots of time remaining
    } else if (ratio > 0.33 && ratio <= 0.66) {
      return 'text-st-info' // Yellow - moderate time remaining
    } else {
      return 'text-st-error' // Red - little time remaining
    }
  }
}

/**
 * Countdown component that displays time remaining until a specific end point
 *
 * @example
 * // For voting countdown (blocks)
 * <Countdown
 *   end={proposal.voteEnd}
 *   timeSource="blocks"
 *   referenceStart={proposal.voteStart}
 *   colorDirection="normal"
 * />
 *
 * @example
 * // For execution countdown (timestamp)
 * <Countdown
 *   end={proposalEta}
 *   timeSource="timestamp"
 *   referenceStart={proposalQueuedTime}
 *   colorDirection="reversed"
 * />
 */
export function Countdown({
  end,
  timeSource,
  referenceStart,
  className,
  colorDirection = 'normal',
}: CountdownProps) {
  const { secondsPerBlock } = useBlockTime()
  const { data: currentBlockNumber } = useBlockNumber()

  // Calculate current time based on timeSource
  const currentTime =
    timeSource === 'blocks'
      ? currentBlockNumber
        ? Big(currentBlockNumber.toString())
        : Big(0)
      : Big(Math.floor(Date.now() / 1000))

  const timeRemainingSec = calculateTimeRemaining(end, currentTime, timeSource, secondsPerBlock)
  const ratio = calculateRatio(end, currentTime, referenceStart)

  // Color coding is automatically disabled if ratio cannot be calculated (no referenceStart)
  const colorClass = ratio !== null ? getColorClass(ratio, colorDirection) : ''

  const timeRemainingMsg = timeRemainingSec > 0 ? formatTimeRemaining(timeRemainingSec) : '-'

  return <Paragraph className={cn(colorClass, className)}>{timeRemainingMsg}</Paragraph>
}

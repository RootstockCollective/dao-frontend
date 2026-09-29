import Big from '@/lib/big'
import { DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK } from '@/lib/constants'

import { TimeSource } from './types'

/**
 * Seconds left until `end`, never negative. Block distances are converted with the average block
 * time, so a vote deadline and a timestamp can be shown the same way.
 */
export const calculateTimeRemaining = (end: Big, currentTime: Big, timeSource: TimeSource): number => {
  const remaining = end.minus(currentTime)
  if (remaining.lte(0)) return 0

  if (timeSource === 'blocks') {
    return remaining.mul(DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK).toNumber()
  } else {
    return remaining.toNumber()
  }
}

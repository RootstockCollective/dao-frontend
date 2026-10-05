import Big from '@/lib/big'
import { DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK } from '@/lib/constants'

import { TimeSource } from './types'

export const calculateTimeRemaining = (end: Big, currentTime: Big, timeSource: TimeSource): number => {
  const remaining = end.minus(currentTime)
  if (remaining.lte(0)) return 0

  if (timeSource === 'blocks') {
    return remaining.mul(DEFAULT_NUMBER_OF_SECONDS_PER_BLOCK).toNumber()
  } else {
    return remaining.toNumber()
  }
}

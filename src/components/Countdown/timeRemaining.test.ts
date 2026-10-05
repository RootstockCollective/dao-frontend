import { describe, expect, it } from 'vitest'

import Big from '@/lib/big'

import { calculateTimeRemaining } from './timeRemaining'

describe('calculateTimeRemaining', () => {
  it('converts blocks with the average block time', () => {
    expect(calculateTimeRemaining(Big(1100), Big(1000), 'blocks')).toBe(100 * 25)
  })

  it('returns seconds as they are for timestamps', () => {
    expect(calculateTimeRemaining(Big(1_700_000_600), Big(1_700_000_000), 'timestamp')).toBe(600)
  })

  it('never goes negative once the end has passed', () => {
    expect(calculateTimeRemaining(Big(1000), Big(1200), 'blocks')).toBe(0)
  })
})

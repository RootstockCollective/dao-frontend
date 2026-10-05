import { Duration } from 'luxon'
import { describe, expect, it } from 'vitest'

import { formatCountdown, formatCountdownFromSeconds } from './formatCountdown'

describe('formatCountdown', () => {
  it('pads hours and minutes like the cycle banner', () => {
    expect(formatCountdown(Duration.fromObject({ days: 3, hours: 4, minutes: 12 }))).toBe('3d 04h 12m')
  })

  it('reads the same from seconds', () => {
    expect(formatCountdownFromSeconds(3 * 86_400 + 4 * 3_600 + 12 * 60 + 59)).toBe('3d 04h 12m')
    expect(formatCountdownFromSeconds(4 * 3_600)).toBe('0d 04h 00m')
  })

  it('never goes negative', () => {
    expect(formatCountdownFromSeconds(-10)).toBe('0d 00h 00m')
  })
})

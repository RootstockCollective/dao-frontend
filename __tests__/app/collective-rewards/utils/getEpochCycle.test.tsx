import { describe, test, expect } from '@jest/globals'
import {
  getCycleDurationInDays,
  getCycleEndTimestamp,
  daysToMillis,
} from '@/app/collective-rewards/utils/getCycle'
import { DateTime, Duration } from 'luxon'

describe('getCycleDurationInDays', () => {
  test.each([0, 1, 7, 30, 45])('should return the correct cycle duration for %i days', expectedDays => {
    const durationInMillis = daysToMillis(expectedDays)
    expect(getCycleDurationInDays(durationInMillis)).toBe(expectedDays.toString())
  })
})

describe('getCycleEndTimestamp', () => {
  const now = DateTime.now()
  test.each([
    {
      startDate: now.toMillis(),
      cycleDurationInMillis: daysToMillis(7),
      expectedCycleEndTimestamp: now.plus({ days: 7 }),
      now,
    },
    {
      startDate: now.minus(Duration.fromObject({ days: 6 })).toMillis(),
      cycleDurationInMillis: daysToMillis(7),
      expectedCycleEndTimestamp: now.plus({ days: 1 }),
      now,
    },
    {
      startDate: now.minus(Duration.fromObject({ days: 8 })).toMillis(),
      cycleDurationInMillis: daysToMillis(7),
      expectedCycleEndTimestamp: now.plus({ days: 6 }),
      now,
    },
    {
      startDate: now
        .minus(Duration.fromObject({ days: 6, hours: 23, minutes: 59, seconds: 59, milliseconds: 999 }))
        .toMillis(),
      cycleDurationInMillis: daysToMillis(7),
      expectedCycleEndTimestamp: now.plus(Duration.fromObject({ milliseconds: 1 })),
      now,
    },
    {
      startDate: now.minus(Duration.fromObject({ days: 23 })).toMillis(),
      cycleDurationInMillis: daysToMillis(7),
      expectedCycleEndTimestamp: now.plus(Duration.fromObject({ days: 5 })),
      now,
    },
  ])(
    'should return the correct cycle end timestamp with (start: $startDate, duration: $cycleDurationInMillis)',
    ({ startDate, cycleDurationInMillis, expectedCycleEndTimestamp, now }) => {
      expect(getCycleEndTimestamp(startDate, cycleDurationInMillis, now).toISO()).toBe(
        expectedCycleEndTimestamp.toISO(),
      )
    },
  )
})

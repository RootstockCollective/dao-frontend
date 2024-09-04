import { describe, test, expect } from '@jest/globals'
import { getEpochDurationInDays, getEpochEndTimestamp, daysToMillis } from '@/app/bim/hooks/useGetEpochCycle'
import { DateTime, Duration } from 'luxon'

describe('getEpochDurationInDays', () => {
  test.each([0, 1, 7, 30, 45])('should return the correct epoch duration for %i days', expectedDays => {
    const durationInMillis = daysToMillis(expectedDays)
    expect(getEpochDurationInDays(durationInMillis)).toBe(expectedDays.toString())
  })
})

describe('getEpochEndTimestamp', () => {
  const now = DateTime.now()
  test.each([
    {
      startDate: now.toMillis(),
      epochDurationInMillis: daysToMillis(7),
      expectedEpochEndTimestamp: now.plus({ days: 7 }),
      now,
    },
    {
      startDate: now.minus(Duration.fromObject({ days: 6 })).toMillis(),
      epochDurationInMillis: daysToMillis(7),
      expectedEpochEndTimestamp: now.plus({ days: 1 }),
      now,
    },
    {
      startDate: now.minus(Duration.fromObject({ days: 8 })).toMillis(),
      epochDurationInMillis: daysToMillis(7),
      expectedEpochEndTimestamp: now.plus({ days: 6 }),
      now,
    },
    {
      startDate: now
        .minus(Duration.fromObject({ days: 6, hours: 23, minutes: 59, seconds: 59, milliseconds: 999 }))
        .toMillis(),
      epochDurationInMillis: daysToMillis(7),
      expectedEpochEndTimestamp: now.plus(Duration.fromObject({ milliseconds: 1 })),
      now,
    },
    {
      startDate: now.minus(Duration.fromObject({ days: 23 })).toMillis(),
      epochDurationInMillis: daysToMillis(7),
      expectedEpochEndTimestamp: now.plus(Duration.fromObject({ days: 5 })),
      now,
    },
  ])(
    'should return the correct epoch end timestamp with (start: $startDate, duration: $epochDurationInMillis)',
    ({ startDate, epochDurationInMillis, expectedEpochEndTimestamp, now }) => {
      expect(getEpochEndTimestamp(startDate, epochDurationInMillis, now).toISO()).toBe(
        expectedEpochEndTimestamp.toISO(),
      )
    },
  )
})

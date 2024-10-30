import { CYCLE_DURATION_IN_DAYS, FIRST_CYCLE_START_DATE_ISO } from '@/lib/constants'
import { DateTime, Duration } from 'luxon'

export type Cycle = {
  remainingDays: Duration
  cycleDuration: string
  cycleEndTimestamp: DateTime<true>
}

export const daysToMillis = (days: number) => 1000 * 60 * 60 * 24 * days

// FIXME: parsing to be reviewed
const days = +(CYCLE_DURATION_IN_DAYS || '14')
const durationInMillis = daysToMillis(days)
const startDate = DateTime.fromISO(FIRST_CYCLE_START_DATE_ISO || '1970-01-01T00:00:00Z')

export const getCycle = () => {
  const now = DateTime.now()
  const cycleDuration = getCycleDurationInDays(durationInMillis)

  const cycleEndTimestamp = getCycleEndTimestamp(startDate.toMillis(), durationInMillis, now)
  const remainingDays = Duration.fromMillis(cycleEndTimestamp.toMillis() - now.toMillis())
  return { remainingDays, cycleDuration, cycleEndTimestamp }
}

export const getCycleDurationInDays = (durationInMillis: number) =>
  Duration.fromMillis(durationInMillis).toFormat('d')

export const getCycleEndTimestamp = (
  startDateMillis: number,
  cycleDurationInMillis: number,
  now: DateTime<true> = DateTime.now(),
) =>
  /* It must reflect the cycle start/end defined in the smart contracts
   * https://github.com/rsksmart/builder-incentives-sc/blob/main/src/libraries/CycleLib.sol
   *
   * cycle start  = now - ( (now - beginning) % duration)
   * cycle end  = cycle start + duration
   */
  now
    .minus(now.minus(startDateMillis).toMillis() % cycleDurationInMillis) // cycle start
    .plus(cycleDurationInMillis)

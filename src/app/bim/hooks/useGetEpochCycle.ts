import { EPOCH_DURATION_IN_DAYS, FIRST_EPOCH_START_DATE_ISO } from '@/lib/constants'
import { DateTime, Duration } from 'luxon'

export type EpochCycle = {
  remainingDays: Duration
  epochDuration: string
  epochEndTimestamp: DateTime<true>
}

export const daysToMillis = (days: number) => 1000 * 60 * 60 * 24 * days

// FIXME: parsing to be reviewed
const days = +(EPOCH_DURATION_IN_DAYS || '14')
const durationInMillis = daysToMillis(days)
const startDate = DateTime.fromISO(FIRST_EPOCH_START_DATE_ISO || '1970-01-01T00:00:00Z')

export const useGetEpochCycle = () => {
  const now = DateTime.now()
  const epochDuration = getEpochDurationInDays(durationInMillis)

  const epochEndTimestamp = getEpochEndTimestamp(startDate.toMillis(), durationInMillis, now)
  const remainingDays = Duration.fromMillis(epochEndTimestamp.toMillis() - now.toMillis())
  return { remainingDays, epochDuration, epochEndTimestamp }
}

export const getEpochDurationInDays = (durationInMillis: number) =>
  Duration.fromMillis(durationInMillis).toFormat('d')

export const getEpochEndTimestamp = (
  startDateMillis: number,
  epochDurationInMillis: number,
  now: DateTime<true> = DateTime.now(),
) =>
  /* It must reflect the epoch start/end defined in the smart contracts
   * https://github.com/rsksmart/builder-incentives-sc/blob/main/src/libraries/EpochLib.sol
   *
   * epoch start  = now - ( (now - beginning) % duration)
   * epoch end  = epoch start + duration
   */
  now
    .minus(now.minus(startDateMillis).toMillis() % epochDurationInMillis) // epoch start
    .plus(epochDurationInMillis)

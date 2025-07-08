import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric } from '@/components/Metric'
import { DateTime, Duration } from 'luxon'

// retrieved from the first release of the dapp
const FIRST_CYCLE_START_DATE_ISO = '2024-10-30T00:00:00Z'

export const CycleNumber = ({ duration, isLoading }: { duration: Duration; isLoading: boolean }) => {
  if (isLoading) {
    return <LoadingSpinner />
  }
  const startDate = DateTime.fromISO(FIRST_CYCLE_START_DATE_ISO)
  const durationInDays = duration.as('days')
  const now = DateTime.now()
  const totalDuration = now.diff(startDate, 'days')
  const cycleNumber = Math.floor(totalDuration.as('days') / durationInDays)
  return <Metric title="Cycle"> {cycleNumber}</Metric>
}

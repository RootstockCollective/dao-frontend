import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric } from '@/components/Metric'
import { DateTime, Duration } from 'luxon'

export const CycleDay = ({
  cycleStart,
  duration,
  isLoading,
}: {
  cycleStart: DateTime
  duration: Duration
  isLoading: boolean
}) => {
  if (isLoading) {
    return <LoadingSpinner />
  }
  const now = DateTime.now()
  const diff = now.diff(cycleStart, 'days')
  const daysElapsed = Math.floor(diff.as('days'))
  const totalDays = Math.floor(duration.as('days'))
  const displayDays = (daysElapsed % totalDays) + 1

  return (
    <Metric title="Day">
      {displayDays}/{totalDays}
    </Metric>
  )
}

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
  return (
    <Metric title="Day">
      {diff.days}/{duration.days}
    </Metric>
  )
}

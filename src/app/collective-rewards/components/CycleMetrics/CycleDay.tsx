import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Metric } from '@/components/Metric'
import { DateTime, Duration } from 'luxon'

export const CycleDayContent = ({ cycleStart, duration }: { cycleStart: DateTime; duration: Duration }) => {
  const now = DateTime.now()
  const diff = now.diff(cycleStart, 'days')
  const daysElapsed = Math.floor(diff.as('days'))
  const totalDays = Math.floor(duration.as('days'))
  // totalDays should never be 0, but we include it for safety as in some envs we may play with the duration
  const displayDays = totalDays === 0 ? 0 : (daysElapsed % totalDays) + 1

  return (
    <Metric title="Day" className="w-auto" containerClassName="gap-4">
      <div className="font-kk-topo text-lg font-normal tracking-tight">
        {displayDays}/{totalDays}
      </div>
    </Metric>
  )
}

export const CycleDay = withSpinner(CycleDayContent)

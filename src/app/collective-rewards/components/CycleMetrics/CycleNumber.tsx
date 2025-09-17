import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Metric } from '@/components/Metric'
import { DateTime, Duration } from 'luxon'
import { FIRST_CYCLE_START_DATE_ISO } from '../../constants/chartConstants'

const CycleNumberContent = ({
  duration,
  firstCycleStartDate = DateTime.fromISO(FIRST_CYCLE_START_DATE_ISO),
}: {
  duration: Duration
  firstCycleStartDate?: DateTime
}) => {
  const durationInDays = duration.as('days')
  const now = DateTime.now()
  const totalDuration = now.diff(firstCycleStartDate, 'days')
  const cycleNumber = Math.floor(totalDuration.as('days') / durationInDays) + 1
  return (
    <Metric title="Cycle" className="w-auto" containerClassName="gap-0 md:gap-4">
      <div className="font-kk-topo font-normal tracking-tight text-xl">{cycleNumber}</div>
    </Metric>
  )
}

export const CycleNumber = withSpinner(CycleNumberContent)

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Metric } from '@/components/Metric'
import { DateTime, Duration } from 'luxon'

// retrieved from the first release of the dapp
const FIRST_CYCLE_START_DATE_ISO = '2024-10-30T00:00:00Z'

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
    <Metric title="Cycle" className="w-auto" containerClassName="gap-4">
      <div className="font-kk-topo text-lg font-normal tracking-tight">{cycleNumber}</div>
    </Metric>
  )
}

export const CycleNumber = withSpinner(CycleNumberContent)

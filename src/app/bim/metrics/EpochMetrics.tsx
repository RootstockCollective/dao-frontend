import { MetricsCard } from '@/components/MetricsCard'
import { getEpochCycle } from '@/app/bim/utils/getEpochCycle'

export const EpochMetrics = () => {
  const { remainingDays, epochDuration, epochEndTimestamp } = getEpochCycle()
  const remainingDaysString: string =
    remainingDays.as('day') > 1
      ? `${Math.floor(remainingDays.as('day'))} days`
      : remainingDays.as('hour') > 1
        ? `${Math.floor(remainingDays.as('hours'))} hours`
        : remainingDays.as('minute') > 1
          ? `${Math.floor(remainingDays.as('minutes'))} minutes`
          : '1 minute'

  return (
    <MetricsCard
      title="Current epoch cycle"
      amount={remainingDaysString}
      fiatAmount={`out of ${epochDuration} days. Ends ${epochEndTimestamp.toFormat('EEE, dd MMM')}`}
      borderless
    />
  )
}

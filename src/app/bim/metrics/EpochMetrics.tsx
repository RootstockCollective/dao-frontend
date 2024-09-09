import { MetricsCard } from '@/components/MetricsCard'
import { useGetEpochCycle } from '@/app/bim/hooks/useGetEpochCycle'

export const EpochMetrics = () => {
  const { remainingDays, epochDuration, epochEndTimestamp } = useGetEpochCycle()
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
    />
  )
}
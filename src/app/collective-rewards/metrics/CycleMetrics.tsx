import { MetricsCard } from '@/components/MetricsCard'
import { getCycle } from '@/app/collective-rewards/utils/getCycle'

export const CycleMetrics = () => {
  const { remainingDays, cycleDuration, cycleEndTimestamp } = getCycle()
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
      title="Current cycle"
      amount={remainingDaysString}
      fiatAmount={`out of ${cycleDuration} days. Ends ${cycleEndTimestamp.toFormat('EEE, dd MMM')}`}
      borderless
    />
  )
}

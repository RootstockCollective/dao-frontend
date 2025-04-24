import { useCycleContext } from '@/app/collective-rewards/metrics'
import { MetricsCard, MetricsCardTitle, TokenMetricsCardRow } from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { useReadCycleTimeKeeper } from '@/shared/hooks/contracts'
import { Duration } from 'luxon'
import { useEffect, useState } from 'react'
import { useIntervalTimestamp } from './hooks/useIntervalTimestamp'

export const CycleMetrics = () => {
  const [timeRemaining, setTimeRemaining] = useState<Duration>(Duration.fromObject({ minutes: 0 }))
  const timestamp = useIntervalTimestamp()
  const {
    data: { cycleDuration, cycleNext },
    isLoading: cycleLoading,
    error: cycleError,
  } = useCycleContext()
  const {
    data: timeUntilNextCycle,
    isLoading: timeUntilNextCycleLoading,
    error: timeUntilNextCycleError,
  } = useReadCycleTimeKeeper(
    { functionName: 'timeUntilNextCycle', args: [timestamp] },
    {
      initialData: 0n,
    },
  )

  const error = cycleError ?? timeUntilNextCycleError
  useHandleErrors({ error, title: 'Error loading cycle metrics' })

  const duration =
    cycleDuration.as('days') < 1 ? cycleDuration.shiftTo('hours') : cycleDuration.shiftTo('days')

  useEffect(() => {
    const nextCycle = Duration.fromObject({ seconds: Number(timeUntilNextCycle) })

    if (nextCycle.as('minutes') < 61) {
      setTimeRemaining(nextCycle.shiftTo('minutes').mapUnits(Math.floor))
    } else if (nextCycle.as('hours') < 25) {
      setTimeRemaining(nextCycle.shiftTo('hours', 'minutes').mapUnits(Math.floor))
    } else {
      setTimeRemaining(nextCycle.shiftTo('days', 'hours').mapUnits(Math.floor))
    }
  }, [timeUntilNextCycle])

  const isLoading = cycleLoading || timeUntilNextCycleLoading

  return (
    <MetricsCard borderless>
      <MetricsCardTitle title="Current cycle" data-testid="CurrentCycle" />
      {withSpinner(TokenMetricsCardRow, { size: 'small' })({
        amount: `${timeRemaining.toHuman()}`,
        fiatAmount: `out of ${duration.toHuman()}. Ends ${cycleNext.toFormat('EEE, dd MMM')}`,
        isLoading,
      })}
    </MetricsCard>
  )
}

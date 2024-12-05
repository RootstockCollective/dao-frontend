import { useCycleContext, useGetTimeUntilNextCycle } from '@/app/collective-rewards/metrics'
import { Duration, DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { MetricsCard, MetricsCardTitle, TokenMetricsCardRow } from '@/app/collective-rewards/rewards'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

export const CycleMetrics = () => {
  const [timeRemaining, setTimeRemaining] = useState<Duration>(Duration.fromObject({ minutes: 0 }))
  const [timestamp, setTimestamp] = useState(BigInt(DateTime.now().toUnixInteger()))

  const {
    data: { cycleDuration, cycleNext },
    isLoading: cycleLoading,
    error: cycleError,
  } = useCycleContext()
  const {
    data: timeUntilNextCycle,
    isLoading: timeUntilNextCycleLoading,
    error: timeUntilNextCycleError,
  } = useGetTimeUntilNextCycle(timestamp)

  const error = cycleError ?? timeUntilNextCycleError
  useHandleErrors({ error, title: 'Error loading cycle metrics' })

  const duration =
    cycleDuration.as('days') < 1 ? cycleDuration.shiftTo('hours') : cycleDuration.shiftTo('days')

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(BigInt(DateTime.now().toUnixInteger()))
    }, AVERAGE_BLOCKTIME)

    return () => clearInterval(interval) // Cleanup interval on component unmount
  }, [])

  useEffect(() => {
    const nextCycle = Duration.fromObject({ seconds: Number(timeUntilNextCycle) })

    if (nextCycle.as('minutes') <= 60) {
      setTimeRemaining(nextCycle.shiftTo('minutes').mapUnits(Math.floor))
    } else if (nextCycle.as('hours') <= 24) {
      setTimeRemaining(nextCycle.shiftTo('hours', 'minutes').mapUnits(Math.floor))
    } else {
      setTimeRemaining(nextCycle.shiftTo('days', 'hours').mapUnits(Math.floor))
    }
  }, [timeUntilNextCycle])

  const isLoading = cycleLoading || timeUntilNextCycleLoading

  return (
    <MetricsCard borderless>
      <MetricsCardTitle title="Current cycle" data-testid="CurrentCycle" />
      {withSpinner(
        TokenMetricsCardRow,
        'min-h-0 grow-0',
      )({
        amount: `${timeRemaining.toHuman()}`,
        fiatAmount: `out of ${duration.toHuman()}. Ends ${cycleNext.toFormat('EEE, dd MMM')}`,
        isLoading,
      })}
    </MetricsCard>
  )
}

import { useCycleContext } from '@/app/collective-rewards/metrics'
import { Duration, DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { MetricsCard, MetricsCardTitle, TokenMetricsCardRow } from '@/app/collective-rewards/rewards'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { useHandleErrors } from '@/app/collective-rewards/utils'

let timeout: NodeJS.Timeout

export const CycleMetrics = () => {
  const [timeRemaining, setTimeRemaining] = useState<Duration>(Duration.fromObject({ minutes: 0 }))
  let {
    data: { cycleDuration, cycleNext },
    isLoading,
    error,
  } = useCycleContext()

  useHandleErrors({ error, title: 'Error loading cycle metrics' })

  const duration =
    cycleDuration.as('days') < 1 ? cycleDuration.shiftTo('hours') : cycleDuration.shiftTo('days')

  useEffect(() => {
    if (timeRemaining.as('minutes') > 0) {
      timeout = setTimeout(() => {
        setTimeRemaining(state => state.minus({ minutes: 1 }))
      }, 60000) // every minute
    }

    return () => clearTimeout(timeout)
  }, [timeRemaining])

  useEffect(() => {
    const now = DateTime.now()
    let diff = cycleNext.diff(now, ['days']).mapUnits(unit => Math.floor(unit))

    if (diff.as('days') < 1) {
      diff = cycleNext.diff(now, ['hours', 'minutes']).mapUnits(unit => Math.floor(unit))
    }

    setTimeRemaining(diff)
  }, [cycleNext])

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

import { MetricsCard } from '@/components/MetricsCard'
import { useCycleContext } from '@/app/collective-rewards/metrics'
import { Duration, DateTime } from 'luxon'
import { useEffect, useState } from 'react'

let timeout: NodeJS.Timeout

export const CycleMetrics = () => {
  const [timeRemaining, setTimeRemaining] = useState<Duration>(Duration.fromObject({ minutes: 0 }))
  let {
    data: { cycleDuration, cycleNext },
  } = useCycleContext()

  const duration =
    cycleDuration.as('days') < 1 ? cycleDuration.shiftTo('hours') : cycleDuration.shiftTo('days')

  useEffect(() => {
    if (timeRemaining.as('minutes') > 0) {
      timeout = setTimeout(() => {
        setTimeRemaining(state => state.minus({ minutes: 1 }))
      }, 60000) // every minute
    } else {
      clearTimeout(timeout)
    }

    return () => clearTimeout(timeout)
  }, [timeRemaining.minutes])

  useEffect(() => {
    const now = DateTime.now()
    let diff = cycleNext.diff(now, ['days']).mapUnits(unit => Math.floor(unit))

    if (diff.as('days') < 1) {
      diff = cycleNext.diff(now, ['hours', 'minutes']).mapUnits(unit => Math.floor(unit))
    }

    setTimeRemaining(diff)
  }, [cycleNext])

  return (
    <MetricsCard
      title="Current cycle"
      amount={`${timeRemaining?.toHuman()}`}
      fiatAmount={`out of ${duration.toHuman()}. Ends ${cycleNext.toFormat('EEE, dd MMM')}`}
      borderless
    />
  )
}

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric } from '@/components/Metric'
import { DateTime, Duration } from 'luxon'
import { useCycleContext } from '../../metrics/context'
import { useHandleErrors } from '../../utils'
import { CycleNumber } from './CycleNumber'
import { CycleEndingOn } from './CycleEndingOn'
import { CycleDay } from './CycleDay'

const CycleMetricsLoader = () => {
  const {
    data: { cycleDuration, cycleNext, cycleStart },
    isLoading,
    error,
  } = useCycleContext()

  useHandleErrors({ error, title: 'Error loading cycle' })

  // FIXME: this is a hack to get the duration in days or hours, but I don't think we need to do it
  const duration =
    cycleDuration.as('days') < 1 ? cycleDuration.shiftTo('hours') : cycleDuration.shiftTo('days')
  return (
    <>
      <CycleNumber duration={duration} isLoading={isLoading} />
      <CycleEndingOn cycleNext={cycleNext} isLoading={isLoading} />
      <CycleDay cycleStart={cycleStart} duration={duration} isLoading={isLoading} />
    </>
  )
}

export const CycleMetrics = CycleMetricsLoader

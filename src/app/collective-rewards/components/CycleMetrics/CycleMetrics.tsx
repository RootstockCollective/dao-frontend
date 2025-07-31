import { useCycleContext } from '@/app/context'
import { useHandleErrors } from '@/app/utils'
import { CycleDay } from './CycleDay'
import { CycleEndingOn } from './CycleEndingOn'
import { CycleNumber } from './CycleNumber'

export const CycleMetrics = () => {
  const {
    data: { cycleDuration, cycleNext, cycleStart },
    isLoading,
    error,
  } = useCycleContext()

  useHandleErrors({ error, title: 'Error loading cycle' })

  // TODO: this is a hack to get the duration in days or hours, but I don't think we need to do it
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

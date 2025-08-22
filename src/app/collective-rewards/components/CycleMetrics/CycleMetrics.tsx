import { useCycleContext } from '@/app/collective-rewards/metrics/context'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { CycleDay } from './CycleDay'
import { CycleEndingOn } from './CycleEndingOn'
import { CycleNumber } from './CycleNumber'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

export const CycleMetrics = () => {
  const {
    data: { cycleDuration, cycleNext, cycleStart },
    isLoading,
    error,
  } = useCycleContext()
  const isDesktop = useIsDesktop()

  useHandleErrors({ error, title: 'Error loading cycle' })

  // TODO: this is a hack to get the duration in days or hours, but I don't think we need to do it
  const duration =
    cycleDuration.as('days') < 1 ? cycleDuration.shiftTo('hours') : cycleDuration.shiftTo('days')

  const content = (
    <>
      <CycleNumber duration={duration} isLoading={isLoading} />
      <CycleEndingOn cycleNext={cycleNext} isLoading={isLoading} />
      <CycleDay cycleStart={cycleStart} duration={duration} isLoading={isLoading} />
    </>
  )
  if (isDesktop) {
    return content
  }
  return <div className="flex flex-row gap-4 justify-between">{content}</div>
}

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric } from '@/components/Metric'
import { DateTime } from 'luxon'

export const CycleEndingOn = ({ cycleNext, isLoading }: { cycleNext: DateTime; isLoading: boolean }) => {
  if (isLoading) {
    return <LoadingSpinner />
  }
  return (
    <Metric title="Cycle ending on" className="w-auto" containerClassName="gap-4">
      <div className="font-kk-topo text-lg font-normal tracking-tight">{cycleNext.toFormat('LLLL dd')}</div>
    </Metric>
  )
}

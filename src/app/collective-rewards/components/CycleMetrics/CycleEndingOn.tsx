import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { Metric } from '@/components/Metric'
import { DateTime } from 'luxon'

export const CycleEndingOnContent = ({ cycleNext }: { cycleNext: DateTime }) => {
  return (
    <Metric title="Cycle ending on" className="w-auto" containerClassName="gap-4">
      <div className="font-kk-topo text-lg font-normal tracking-tight">{cycleNext.toFormat('LLLL dd')}</div>
    </Metric>
  )
}

export const CycleEndingOn = withSpinner(CycleEndingOnContent)

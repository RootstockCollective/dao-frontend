import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric } from '@/components/Metric'
import { DateTime } from 'luxon'

export const CycleEndingOn = ({ cycleNext, isLoading }: { cycleNext: DateTime; isLoading: boolean }) => {
  if (isLoading) {
    return <LoadingSpinner />
  }
  return <Metric title="Cycle ending on"> {cycleNext.toFormat('EEE, dd MMM')}</Metric>
}

import { ActionsContainer } from '@/components/containers'
import { CycleMetrics } from '../CycleMetrics'
import { EstimatedRewards } from '../EstimatedRewards'
import { TotalBackingLoader } from '../TotalBacking'

export const CurrentCycle = () => {
  return (
    <ActionsContainer
      className="flex flex-col gap-10 pl-6 pt-6 pr-6 pb-10 bg-v3-bg-accent-80"
      title="THE REWARDS AT WORK - CURRENT CYCLE"
    >
      <div className="flex justify-between items-start w-full">
        <CycleMetrics />
        <TotalBackingLoader />
        <EstimatedRewards />
      </div>
    </ActionsContainer>
  )
}

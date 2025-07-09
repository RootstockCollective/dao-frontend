import { ActionsContainer } from '@/components/containers'
import { CycleMetrics } from '@/app/collective-rewards/components/CycleMetrics'
import { EstimatedRewards } from '@/app/collective-rewards/components/EstimatedRewards'
import { TotalBackingLoader } from '@/app/collective-rewards/components/TotalBacking'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'

export const CurrentCycle = () => {
  return (
    <ActionsContainer
      className="flex flex-col gap-10 pl-6 pt-6 pr-6 pb-10 bg-v3-bg-accent-80"
      title="THE REWARDS AT WORK - CURRENT CYCLE"
    >
      <div className="flex justify-between items-start w-full">
        <CycleContextProvider>
          <CycleMetrics />
        </CycleContextProvider>
        <TotalBackingLoader />
        <EstimatedRewards />
      </div>
    </ActionsContainer>
  )
}

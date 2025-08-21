import { CycleMetrics } from '@/app/collective-rewards/components/CycleMetrics'
import { EstimatedRewards } from '@/app/collective-rewards/components/EstimatedRewards'
import { TotalBackingLoader } from '@/app/collective-rewards/components/TotalBacking'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { ActionsContainer } from '@/components/containers'
import { Header } from '@/components/Typography'

export const CurrentCycle = () => {
  return (
    <ActionsContainer
      className="flex flex-col gap-10 pl-6 pt-6 pr-6 pb-10 bg-v3-bg-accent-80"
      title={
        <Header variant="h3" caps>
          THE REWARDS AT WORK - CURRENT CYCLE
        </Header>
      }
    >
      <div className="w-full flex flex-col gap-10">
        <div className="flex items-start w-full justify-between md:w-[90%] mx-auto">
          <CycleContextProvider>
            <CycleMetrics />
          </CycleContextProvider>
          <TotalBackingLoader />
          <EstimatedRewards />
        </div>
      </div>
    </ActionsContainer>
  )
}

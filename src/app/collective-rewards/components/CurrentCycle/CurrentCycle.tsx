import { CycleMetrics } from '@/app/collective-rewards/components/CycleMetrics'
import { EstimatedRewards } from '@/app/collective-rewards/components/EstimatedRewards'
import { TotalBackingLoader } from '@/app/collective-rewards/components/TotalBacking'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { ActionsContainer } from '@/components/containers'
import { Header } from '@/components/Typography'

export const CurrentCycle = () => {
  return (
    <ActionsContainer
      className="flex flex-col gap-10 px-4 py-8 md:px-6 md:pt-6 md:pb-10 bg-v3-bg-accent-80"
      title={
        <Header variant="h3" caps>
          THE REWARDS AT WORK - CURRENT CYCLE
        </Header>
      }
    >
      <div className="flex flex-col md:flex-row items-start w-full gap-4 md:gap-14">
        <div className="flex justify-between flex-col md:flex-row w-full md:basis-3/4 gap-4 md:gap-0">
          <CycleContextProvider>
            <CycleMetrics />
          </CycleContextProvider>
          <TotalBackingLoader />
        </div>
        <div className="w-full md:basis-1/4">
          <EstimatedRewards />
        </div>
      </div>
    </ActionsContainer>
  )
}

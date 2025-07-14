import { CycleMetrics } from '@/app/collective-rewards/components/CycleMetrics'
import { EstimatedRewards } from '@/app/collective-rewards/components/EstimatedRewards'
import { TotalBackingLoader } from '@/app/collective-rewards/components/TotalBacking'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { ActionsContainer } from '@/components/containers'
import { Header } from '@/components/TypographyNew'

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

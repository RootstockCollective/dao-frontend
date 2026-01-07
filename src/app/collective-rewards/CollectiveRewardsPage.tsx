'use client'

import { CycleMetrics } from '@/app/collective-rewards/components/CycleMetrics'
import { EstimatedRewards } from '@/app/collective-rewards/components/EstimatedRewards'
import { TotalBackingLoader } from '@/app/collective-rewards/components/TotalBacking'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { AnnualBackersIncentives } from '@/app/shared/components/AnnualBackersIncentives'
import { ActionMetricsContainer, ActionsContainer } from '@/components/containers'
import { Header } from '@/components/Typography'
import { CallToActionSection } from './components/CallToActionSection'
import { CollectiveRewardsChartContainer } from './components/CollectiveRewardsChart'
import { TotalRewardsDistributed } from './components/TotalRewardsDistributed'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

const NAME = 'Collective Rewards'
export const CollectiveRewardsPage = () => {
  const isDesktop = useIsDesktop()
  return (
    <div className="flex flex-col">
      <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
        {NAME}
      </Header>

      <div className="flex flex-col gap-2">
        <ActionMetricsContainer className="flex flex-row gap-2 bg-v3-bg-accent-80">
          <AnnualBackersIncentives className="basis-3/4" />
          <TotalRewardsDistributed className="basis-1/4" />
        </ActionMetricsContainer>

        {/* Current Cycle Section */}
        <ActionsContainer
          className="flex flex-col gap-10 px-4 py-8 md:px-6 md:pt-6 md:pb-10 bg-v3-bg-accent-80"
          title={
            <Header variant="h3" caps>
              THE REWARDS AT WORK - {!isDesktop && <br />} CURRENT CYCLE
            </Header>
          }
        >
          <div className="flex flex-col gap-10 w-full">
            <div className="flex flex-col md:flex-row gap-4 items-start justify-around">
              <CycleContextProvider>
                <CycleMetrics />
              </CycleContextProvider>
              <TotalBackingLoader />
              <EstimatedRewards />
            </div>
            <CollectiveRewardsChartContainer />
          </div>
        </ActionsContainer>

        <CallToActionSection />
      </div>
    </div>
  )
}

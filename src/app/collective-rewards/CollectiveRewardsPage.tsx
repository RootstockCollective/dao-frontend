'use client'

import { Header } from '@/components/TypographyNew'
import { ActionMetricsContainer } from '@/components/containers'
import { AnnualBackersIncentives } from './components/AnnualBackersIncentives'
import { CallToActionSection } from './components/CallToActionSection'
import { CurrentCycle } from './components/CurrentCycle'
import { TotalRewardsDistributed } from './components/TotalRewardsDistributed'

const NAME = 'Collective Rewards'
export const CollectiveRewardsPage = () => {
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
        <CurrentCycle />
        <CallToActionSection />
      </div>
    </div>
  )
}

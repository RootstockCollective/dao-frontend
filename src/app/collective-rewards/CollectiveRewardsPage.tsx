'use client'

import { Header } from '@/components/TypographyNew'
import { ActionMetricsContainer, InfoContainer } from '@/components/containers'
import { AnnualBackersIncentives } from './components/AnnualBackersIncentives'
import { TotalRewardsDistributed } from './components/TotalRewardsDistributed'
import { CallToActionSection } from './components/CallToActionSection'

const NAME = 'Collective Rewards'
export const CollectiveRewardsPage = () => {
  return (
    <div className="flex flex-col">
      <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
        {NAME}
      </Header>

      <div className="flex flex-col gap-2">
        <ActionMetricsContainer className="flex flex-row gap-2 bg-v3-bg-accent-80">
          <AnnualBackersIncentives className="basis-2/3" />
          <TotalRewardsDistributed className="basis-1/3" />
        </ActionMetricsContainer>
        <CallToActionSection />
      </div>
    </div>
  )
}

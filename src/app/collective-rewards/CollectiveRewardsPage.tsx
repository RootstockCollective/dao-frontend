'use client'

import { Header } from '@/components/TypographyNew'
import { InfoContainer, MetricsContainer } from '@/components/containers'

const NAME = 'Collective Rewards'
export const CollectiveRewardsPage = () => {
  return (
    <div className="flex flex-col">
      <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
        {NAME}
      </Header>

      <div className="flex flex-col gap-2">
        <MetricsContainer>Metrics</MetricsContainer>
        <InfoContainer>Bottom content placeholder</InfoContainer>
      </div>
    </div>
  )
}

'use client'
// TODO: I don't like the fact that this page is a client component, but otherwise many components need to be changed to accommodate this

import { ActionMetricsContainer, InfoContainer, MetricsContainer } from '@/components/containers'
import { Header } from '@/components/TypographyNew'
import { Content } from './components/Content'
import { Metrics } from './components/Metrics'
import { Spotlight } from './components/Spotlight'
import BuildersTableContainer from './components/Table/BuildersTableContainer'

const NAME = 'Builders'
export const BuildersPage = () => {
  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-6 rounded-sm">
      <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
        {NAME}
      </Header>

      <div data-testid="info" className="flex flex-col w-full items-start gap-2">
        <MetricsContainer className="bg-v3-bg-accent-80">
          <Metrics />
        </MetricsContainer>
        <InfoContainer className="grow-[3] bg-v3-bg-accent-80">
          <Content />
        </InfoContainer>
        <ActionMetricsContainer className="bg-v3-bg-accent-80">
          <Spotlight />
        </ActionMetricsContainer>
        <BuildersTableContainer />
      </div>
    </div>
  )
}

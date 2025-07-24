'use client'
// TODO: I don't like the fact that this page is a client component, but otherwise many components need to be changed to accommodate this

import { MetricsContainer } from '@/components/containers'
import { Header } from '@/components/TypographyNew'
import { Metrics } from './components/Metrics'
import BecomeBuilderBanner from './components/BecomeBuilderBanner/BecomeBuilderBanner'
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
        <BecomeBuilderBanner />
        <BuildersTableContainer />
      </div>
    </div>
  )
}

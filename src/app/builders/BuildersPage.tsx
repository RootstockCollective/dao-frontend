'use client'
// TODO: I don't like the fact that this page is a client component, but otherwise many components need to be changed to accommodate this

import { MetricsContainer } from '@/components/containers'

import { BuildersBanner } from './components/BuildersBanner'
import { Metrics } from './components/Metrics'
import BuildersTableContainer from './components/Table/BuildersTableContainer'
import { WhyBecomeABuilder } from './components/WhyBecomeABuilder'

const NAME = 'Builders'
export const BuildersPage = () => {
  return (
    <div data-testid={NAME} className="flex flex-col w-full h-full pt-[0.13rem] rounded-sm">
      <div data-testid="info" className="flex flex-col w-full gap-2">
        <BuildersBanner />
        <MetricsContainer className="bg-v3-bg-accent-80">
          <Metrics />
        </MetricsContainer>
        <WhyBecomeABuilder />
        <div id="builders-table" className="w-full scroll-mt-6">
          <BuildersTableContainer />
        </div>
      </div>
    </div>
  )
}

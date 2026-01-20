'use client'

import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { Header } from '@/components/Typography'
import { Section } from '../components/Section'
import BuilderTransactionHistoryContainer from '../builder/components/BuilderTransactionHistoryContainer'

const NAME = 'Builder Claiming History'

export const BuilderTransactionHistoryPage = () => {
  return (
    <CycleContextProvider>
      <div
        data-testid={NAME}
        className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm"
      >
        <Header caps variant="h1" className="text-3xl leading-10 pb-[2.5rem]">
          {NAME}
        </Header>
        <div data-testid="main-container" className="flex flex-col w-full items-start gap-2">
          <Section>
            <BuilderTransactionHistoryContainer />
          </Section>
        </div>
      </div>
    </CycleContextProvider>
  )
}

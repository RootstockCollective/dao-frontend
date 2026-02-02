'use client'

import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { Header } from '@/components/Typography'
import { Section } from '../components/Section'
import TransactionHistoryTableContainer from './components/TransactionHistoryTableContainer'

const NAME = 'Transactions History'
export const TransactionHistoryPage = () => {
  return (
    <CycleContextProvider>
      <div
        data-testid={NAME}
        className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm"
      >
        <Header caps variant="h1" className="pb-10">
          {NAME}
        </Header>
        <div data-testid="main-container" className="flex flex-col w-full items-start gap-2">
          <Section>
            <TransactionHistoryTableContainer />
          </Section>
        </div>
      </div>
    </CycleContextProvider>
  )
}

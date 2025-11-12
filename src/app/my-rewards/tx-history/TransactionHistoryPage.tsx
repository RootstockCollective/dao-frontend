'use client'

import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { withBuilderSettingsProvider } from '@/app/collective-rewards/settings'
import { Header } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { Section } from '../components/Section'
import TransactionHistoryTableContainer from './components/Table/TransactionHistoryTableContainer'

const NAME = 'Transactions History'
const TransactionHistoryPage = () => {
  const { address: userAddress, isConnected } = useAccount()
  const router = useRouter()

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
            <TransactionHistoryTableContainer />
          </Section>
        </div>
      </div>
    </CycleContextProvider>
  )
}

export default withBuilderSettingsProvider(TransactionHistoryPage)

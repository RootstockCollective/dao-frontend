'use client'

import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { Header } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Section } from '@/app/my-rewards/components/Section'
import TransactionHistoryTableContainer from './components/TransactionHistoryTableContainer'

const NAME = 'Transactions History'
export const BackerTransactionHistoryPage = () => {
  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

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

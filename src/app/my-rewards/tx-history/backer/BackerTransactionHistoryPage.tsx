'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { Section } from '@/app/my-rewards/components/Section'
import { PageTitle } from '@/components/PageBanner'

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
      <div data-testid={NAME} className="flex flex-col items-start w-full h-full gap-2 rounded-sm">
        <PageTitle className="pb-10">{NAME}</PageTitle>
        <div data-testid="main-container" className="flex flex-col w-full items-start gap-2">
          <Section>
            <TransactionHistoryTableContainer />
          </Section>
        </div>
      </div>
    </CycleContextProvider>
  )
}

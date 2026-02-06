'use client'

import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { useIsBuilder } from '@/app/user/my-holdings/hooks/useIsBuilder'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Section } from '../../components/Section'
import BuilderTransactionHistoryContainer from './components/BuilderTransactionHistoryContainer'

const NAME = 'Builder Claiming History'

export const BuilderTransactionHistoryPage = () => {
  const { isConnected } = useAccount()
  const { isUserBuilder, isLoading } = useIsBuilder()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    } else if (!isLoading && !isUserBuilder) {
      router.push('/my-rewards/tx-history/backer')
    }
  }, [isConnected, isLoading, isUserBuilder, router])

  if (isLoading) {
    return <LoadingSpinner size="large" />
  }

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

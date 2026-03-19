'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header } from '@/components/Typography'
import { usePermissionsManager } from '@/shared/hooks/contracts'

import { RbtcVaultMetricsSection } from './components'

const NAME = 'Fund Manager Dashboard'

export const FundManagerPage = () => {
  const { isConnected } = useAccount()
  const { isFundManager, isLoading } = usePermissionsManager()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isConnected || !isFundManager)) {
      router.push('/')
    }
  }, [isConnected, isFundManager, isLoading, router])

  if (!isConnected || isLoading || !isFundManager) {
    return <LoadingSpinner />
  }

  return (
    <div data-testid={NAME} className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-2 rounded-sm">
      <Header caps variant="h1" className="text-3xl leading-10 pb-10">
        {NAME}
      </Header>
      <RbtcVaultMetricsSection />
    </div>
  )
}
